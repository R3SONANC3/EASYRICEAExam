import express, { Request, Response } from 'express';
import { Router } from 'express';
import pool from '../services/db';


const router: Router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const [inspectionRows] = await pool.query(`
            SELECT 
                i.id,
                i.name,
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
            GROUP BY i.id, i.name, i.createdAt, i.updatedAt, i.samplingDate, i.note, i.price, i.totalSamples, i.imagePath, s.name
        `, [req.params.id]);

        if (Array.isArray(inspectionRows) && inspectionRows.length === 0) {
            res.status(404).json({ message: 'Inspection not found' });
        }

        const [grainDetailRows] = await pool.query(`
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
   

        res.json(inspectionRows);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});


export default router;