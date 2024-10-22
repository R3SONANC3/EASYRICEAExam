import express, { Request, Response } from 'express';
import pool from '../services/db';
import multer from 'multer';
import { ResultSetHeader } from 'mysql2';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

const router = express.Router();

// GET all inspections
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
          i.id,
          i.name,
          i.createdAt,
          s.name AS standard_name,
          i.note,
          i.price,
          i.samplingDatetime
      FROM inspections i
      JOIN standards s ON i.standardID = s.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

router.post('/', upload.single('uploadFile'), async (req: Request, res: Response) => {
  const { name, note, price, samplingDatetime, samplingPoints, grains } = req.body;
  const standardID = req.body.standardID[0];

  console.log(req.body);  
  
  // Validate required fields
  if (!name || !standardID) {
    res.status(400).json({ message: 'name and standardID are required' });
  }

  // Check if file was uploaded
  if (!req.file) {
    res.status(400).json({ message: 'File upload failed or no file uploaded' });
  }

  try {
    // Start a transaction to ensure data consistency
    await pool.query('START TRANSACTION');

    // Insert the inspection into the database
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO inspections (name, standardID, note, price, samplingDatetime, rawDataPath)
           VALUES (?, ?, ?, ?, ?, ?)`,
      [name, standardID, note, price, samplingDatetime, req.file?.filename] // Ensure filename is passed correctly
    );

    // Get the inserted inspection ID
    const inspectionID = result.insertId;

    // Handle sampling points if necessary
    if (samplingPoints) {
      const points = JSON.parse(samplingPoints);
      const pointPromises = points.map((pointID: any) => {
        return pool.query(
          `INSERT INTO inspectionSamplingPoints (inspectionID, samplingPointID)
                   VALUES (?, ?)`,
          [inspectionID, pointID]
        );
      });

      await Promise.all(pointPromises);
    }

    // Handle grains data
    if (grains) {
      const grainData = JSON.parse(grains);
      const grainPromises = grainData.map((grain: any) => {
        return pool.query(
          `INSERT INTO grainDetails (inspectionID, length, weight, shapeID, riceTypeID)
                   VALUES (?, ?, ?, 
                   (SELECT id FROM riceShapes WHERE code = ?), 
                   (SELECT id FROM riceTypes WHERE code = ?))`,
          [inspectionID, grain.length, grain.weight, grain.shape, grain.type]
        );
      });

      await Promise.all(grainPromises);
    }

    // Commit the transaction
    await pool.query('COMMIT');

    res.status(201).json({ message: 'Inspection and grains created successfully', inspectionID });
  } catch (error) {
    // Rollback the transaction if there's an error
    await pool.query('ROLLBACK');

    console.error('Error creating inspection and grains:', error);
    res.status(500).json({ message: 'Error creating inspection and grains', error: (error as Error).message });
  }
});



export default router;
