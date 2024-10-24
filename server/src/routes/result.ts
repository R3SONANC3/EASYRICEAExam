import express, { Request, Response } from 'express';
import { Router } from 'express';
import pool from '../services/db';
import { GrainData, InspectionData, InspectionResponse, Standard, SubStandard } from '../types';
import { RiceCalculationService } from '../services/RiceCalculationService ';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

interface UpdateInspectionRequest extends Omit<InspectionData, 'standardID'> {
    standardId: string;
    samplingPoints: string;
}

function formatToLocalMySQLDate(isoString: string): string {
    const localDate = new Date(isoString);
    localDate.setHours(localDate.getHours() + 7);
    return localDate.toISOString().slice(0, 19).replace('T', ' ');
}

const router: Router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
    const reqid = req.params.id;

    // Start a transaction
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [inspectionRows] = await connection.query<any[]>(`
            SELECT 
                i.id,
                i.name,
                i.standardID,
                i.createdAt,
                i.updatedAt,
                i.samplingDate,
                i.note,
                i.price,
                i.totalSamples,
                i.imagePath,
                s.name AS standardName,
                GROUP_CONCAT(DISTINCT sp.name SEPARATOR ', ') AS samplingPoints
            FROM inspections i
            JOIN standards s ON i.standardID = s.id
            LEFT JOIN inspectionSamplingPoints isp ON i.id = isp.inspectionID
            LEFT JOIN samplingPoints sp ON isp.samplingPointID = sp.id
            WHERE i.id = ?
            GROUP BY i.id, i.name, i.createdAt, i.updatedAt, i.samplingDate,i.note, i.price, i.totalSamples, i.imagePath, s.name
        `, [reqid]);

        if (!inspectionRows || inspectionRows.length === 0) {
            await connection.rollback(); // Rollback if inspection not found
            res.status(404).json({ message: 'Inspection not found' });
        }

        const inspection = inspectionRows[0];

        const [standardRows] = await connection.query<any[]>(`
            SELECT 
                s.id,
                s.name,
                ss.id AS subStandardId,
                ss.keyName AS \`key\`,
                ss.name AS subStandardName,
                ss.maxLength,
                ss.minLength,
                ss.conditionMax,
                ss.conditionMin,
                GROUP_CONCAT(DISTINCT rs.code) AS shapes
            FROM standards s
            JOIN subStandards ss ON s.id = ss.standardID
            LEFT JOIN subStandardShapes sss ON ss.id = sss.subStandardID
            LEFT JOIN riceShapes rs ON sss.shapeID = rs.id
            WHERE s.id = ?
            GROUP BY 
                s.id, s.name, 
                ss.id, ss.keyName, ss.name, 
                ss.maxLength, ss.minLength, 
                ss.conditionMax, ss.conditionMin;
        `, [inspection.standardID]);

        if (!standardRows || standardRows.length === 0) {
            await connection.rollback(); // Rollback if standard not found
            res.status(404).json({ message: 'Standard not found' });
        }

        // Transform standard rows into Standard type
        const standard: Standard = {
            id: standardRows[0].id.toString(),
            name: standardRows[0].name,
            createDate: standardRows[0].createDate,
            standardData: standardRows.map((row): SubStandard => ({
                key: row.key,
                name: row.subStandardName,
                maxLength: row.maxLength,
                minLength: row.minLength,
                conditionMax: row.conditionMax,
                conditionMin: row.conditionMin,
                shape: row.shapes ? row.shapes.split(',') : []
            }))
        };

        // 3. Get grain details
        const [grainRows] = await connection.query<any[]>(`
            SELECT 
                gd.length,
                gd.weight,
                rs.code AS shape,
                rt.code AS type
            FROM grainDetails gd
            JOIN riceShapes rs ON gd.shapeID = rs.id
            JOIN riceTypes rt ON gd.riceTypeID = rt.id
            WHERE gd.inspectionID = ?
        `, [req.params.id]);

        // Transform grain rows into GrainData type
        const grainData: GrainData[] = grainRows.map(row => ({
            length: row.length,
            weight: row.weight,
            shape: row.shape,
            type: row.type
        }));

        // 4. Calculate results
        const calculator = new RiceCalculationService();
        const results = calculator.calculateInspectionResults(grainData, standard);

        // 5. Prepare response
        const response: InspectionResponse = {
            inspection: {
                id: inspection.id,
                name: inspection.name,
                createdAt: inspection.createdAt,
                updatedAt: inspection.updatedAt,
                samplingDate: inspection.samplingDate,
                note: inspection.note,
                price: inspection.price,
                totalSamples: inspection.totalSamples,
                imagePath: inspection.imagePath,
                standardName: inspection.standardName,
                samplingPoints: inspection.samplingPoints
            },
            standard,
            results
        };

        // Commit the transaction
        await connection.commit();
        res.json(response);

    } catch (err) {
        console.error('Error in inspection route:', err);
        await connection.rollback(); // Rollback transaction on error
        res.status(500).json({ error: (err as Error).message });
    } finally {
        if (connection) connection.release(); // Release the connection back to the pool
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    const connection = await pool.getConnection();
    const inspectionId = req.params.id;

    const {
        name,
        standardId,
        note,
        price,
        samplingDateTime,
        samplingPoints
    }: UpdateInspectionRequest = req.body;

    try {
        await connection.beginTransaction();

        const [standardRows] = await connection.execute<RowDataPacket[]>(
            'SELECT id FROM standards WHERE name = ?',
            [standardId]
        );

        if (!standardRows.length) {
            await connection.rollback();
            res.status(400).json({ error: `Standard with name ${standardId} not found` });
        }

        const standardDbId = standardRows[0].id;
        const formattedSamplingDate = formatToLocalMySQLDate(samplingDateTime);

        const [updateResult] = await connection.execute<ResultSetHeader>(
            `UPDATE inspections
            SET 
                name = ?,
                standardID = ?,
                note = ?,
                price = ?,
                samplingDate = ?,
                updatedAt = CONVERT_TZ(NOW(), '+00:00', '+07:00')
            WHERE id = ?;`,
            [name, standardDbId, note || null, price || null, formattedSamplingDate, inspectionId]
        );

        if (updateResult.affectedRows === 0) {
            await connection.rollback();
            res.status(404).json({
                error: 'Inspection not found',
                details: {
                    inspectionId,
                    queryParams: [name, standardDbId, note || null, price || null, formattedSamplingDate, inspectionId]
                }
            });
        }

        // Delete existing sampling points
        await connection.execute(
            `DELETE FROM inspectionSamplingPoints WHERE inspectionID = ?`,
            [inspectionId]
        );

        // Insert new sampling points if provided
        if (samplingPoints) {
            const samplingPointsArray = samplingPoints.split(', ');
            // ดึง sampling point IDs จากตาราง samplingPoints
            const pointIDs = await Promise.all(
                samplingPointsArray.map(async (point) => {
                    const [rows] = await connection.query<RowDataPacket[]>(
                        'SELECT id FROM samplingPoints WHERE name = ?',
                        [point.toLowerCase()]
                    );
                    return rows[0]?.id;
                })
            );

            // ลบ sampling points เก่าที่เกี่ยวข้องกับ inspectionID นี้
            await connection.execute<ResultSetHeader>(
                'DELETE FROM inspectionSamplingPoints WHERE inspectionID = ?',
                [inspectionId]
            );

            // เพิ่ม sampling points ใหม่ที่ได้ ID
            await Promise.all(
                pointIDs
                    .filter((id): id is number => id !== null && id !== undefined)
                    .map((pointID) =>
                        connection.execute<ResultSetHeader>(
                            'INSERT INTO inspectionSamplingPoints (inspectionID, samplingPointID) VALUES (?, ?)',
                            [inspectionId, pointID]
                        )
                    )
            );

            console.log('New sampling points inserted successfully.');
        }


        await connection.commit();
        console.log('Transaction committed');

        const [inspections] = await connection.execute<RowDataPacket[]>(
            `SELECT 
                i.id,
                i.name,
                i.note,
                i.price,
                i.samplingDate,
                i.totalSamples,
                s.name as standardName,
                GROUP_CONCAT(DISTINCT sp.code) as samplingPoints
            FROM inspections i
            LEFT JOIN standards s ON i.standardID = s.id
            LEFT JOIN inspectionSamplingPoints isp ON i.id = isp.inspectionID
            LEFT JOIN samplingPoints sp ON isp.samplingPointID = sp.id
            WHERE i.id = ?
            GROUP BY i.id, i.name, i.note, i.price, i.samplingDate, i.totalSamples, s.name`,
            [inspectionId]
        );

        if (inspections.length === 0) {
            res.status(404).json({
                error: 'Inspection not found after update',
                inspectionId
            });
        }

        res.json(inspections[0]);

    } catch (error) {
        await connection.rollback();
        console.error('Error updating inspection:', error);

        // Provide more detailed error information
        res.status(500).json({
            error: 'Failed to update inspection',
            details: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : 'Unknown error'
        });

    } finally {
        connection.release();
    }
});

export default router;