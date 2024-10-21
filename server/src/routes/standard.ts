import express, { Request, Response } from 'express';
import pool from '../services/db';
import { RowDataPacket } from 'mysql2';

const router = express.Router();

router.get('/', async (req: Request, res: Response)=> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        s.id,
        s.name AS standardName,
        s.createDate,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'conditionMax', ss.conditionMax,
            'conditionMin', ss.conditionMin,
            'key', ss.keyName,
            'name', ss.name,
            'shape', (
              SELECT GROUP_CONCAT(r.name SEPARATOR ', ')
              FROM subStandardShapes sss
              JOIN riceShapes r ON sss.shapeID = r.id
              WHERE sss.subStandardID = ss.id
            ),
            'maxLength', ss.maxLenght,
            'minLength', ss.minLenght
          )
        ) AS standardData
      FROM standards s
      JOIN subStandards ss ON s.id = ss.standardID
      GROUP BY s.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
