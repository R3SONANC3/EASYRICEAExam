import express, { Request, Response } from 'express';
import { Router } from 'express';
import pool from '../services/db';


const router: Router = express.Router();

router.get('/:id', async (req: Request, res: Response) => {
    try {
        const [rows] = await pool.query(`
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

        if (Array.isArray(rows) && rows.length === 0) {
            res.status(404).json({ message: 'Inspection not found' });
        }

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: (err as Error).message });
    }
});


export default router;