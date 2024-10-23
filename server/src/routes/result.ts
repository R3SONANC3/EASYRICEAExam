import express, { Request, Response } from 'express';
import { Router } from 'express';
import pool from '../services/db';
import { GrainData, InspectionResult, Standard, SubStandard } from '../types';
import { RiceCalculationService } from '../services/RiceCalculationService ';

const router: Router = express.Router();

interface InspectionResponse {
    inspection: {
        id: number;
        name: string;
        createdAt: string;
        updatedAt: string;
        samplingDate: string;
        note: string | null;
        price: number | null;
        totalSamples: number;
        imagePath: string | null;
        standardName: string;
        samplingPoints: string;
    };
    standard: Standard;
    results: InspectionResult;
}

router.get('/:id', async (req: Request, res: Response) => {
    const reqid = req.params.id

    try {
        const [inspectionRows] = await pool.query<any[]>(`
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
            res.status(404).json({ message: 'Inspection not found' });
        }

        const inspection = inspectionRows[0];
        
        const [standardRows] = await pool.query<any[]>(`
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
        const [grainRows] = await pool.query<any[]>(`
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

        // 5. Prepare and send response
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

        res.json(response);

    } catch (err) {
        console.error('Error in inspection route:', err);
        res.status(500).json({ error: (err as Error).message });
    }
});

export default router;