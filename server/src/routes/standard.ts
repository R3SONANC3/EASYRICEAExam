import express, { Request, Response } from 'express';

import pool from '../services/db';

const router = express.Router();
// GET all inspections
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM standards
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
