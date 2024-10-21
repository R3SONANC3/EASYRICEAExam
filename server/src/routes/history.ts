import express, { Request, Response } from 'express';
import pool from '../services/db';
import { RowDataPacket, FieldPacket } from 'mysql2';

const router = express.Router();

interface InspectionData extends RowDataPacket {
    id: number;
    name: string;
    createdAt: Date;
    standardName: string;
    note: string;
    totalSamples: number;
}

// Route to get paginated inspections
router.get('/', async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [rows]: [InspectionData[], FieldPacket[]] = await pool.query<InspectionData[]>(`
      SELECT 
        i.id,
        i.name,
        i.createdAt,
        s.name AS standardName,
        i.note,
        i.totalSamples
      FROM inspections i
      JOIN standards s ON i.standardID = s.id
      LIMIT ? OFFSET ?
    `, [limit, offset]);

        const [totalRows]: [RowDataPacket[], FieldPacket[]] = await pool.query('SELECT COUNT(*) as total FROM inspections');
        const totalCount = totalRows[0].total;

        res.json({ data: rows, total: totalCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: (err as Error).message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const [rows]: [InspectionData[], FieldPacket[]] = await pool.query<InspectionData[]>(`
          SELECT 
            i.id,
            i.name,
            i.createdAt,
            s.name AS standardName,
            i.note,
            i.totalSamples
          FROM inspections i
          JOIN standards s ON i.standardID = s.id
          WHERE i.id = ?
        `,[id]);
        res.json({ data: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: (err as Error).message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id =req.params.id;
    try {
        
    } catch (error) {
        
    }
})


export default router;