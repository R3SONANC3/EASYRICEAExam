import express, { Request, Response, NextFunction } from 'express';
import { upload, readUploadedFile } from '../services/fileService';
import { InspectionService } from '../services/inspectionService';
import { InspectionRequest } from '../types/express';
import { InspectionPayload } from '../types';
import pool from '../services/db';

const router = express.Router();
const inspectionService = new InspectionService(pool);

const validateFileUpload = (
  req: InspectionRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
  }
  next();
};

const validateFields = (
  req: InspectionRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.body.name || !req.body.standard || req.body.standard.length === 0) {
    res.status(400).json({ message: 'Missing required fields' });
  }
  next();
};

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

router.post('/',
  upload.single('uploadFile'),
  validateFileUpload,
  validateFields,
  async (req: InspectionRequest, res: Response): Promise<void> => {
    let connection; // Declare the connection variable here for use in the catch block
    try {
      connection = await pool.getConnection(); // Get a connection from the pool
      await connection.query('START TRANSACTION');

      if (!req.file) {
        throw new Error('No file uploaded');
      }

      const fileContents = await readUploadedFile(req.file.path);
      let jsonData: InspectionPayload;

      try {
        jsonData = JSON.parse(fileContents);
        console.log('Parsed JSON data:', jsonData);
        
        if (!jsonData.grains || !Array.isArray(jsonData.grains)) {
          throw new Error('Invalid or missing grains data in uploaded file');
        }
      } catch (parseError) {
        throw new Error(`Error parsing JSON from uploaded file: ${(parseError as Error).message}`);
      }

      const date = new Date(req.body.samplingDateTime);
      const formattedDateTime = date.toISOString().slice(0, 19).replace('T', ' ');

      const inspectionID = await inspectionService.createInspection({
        name: req.body.name,
        standardID: req.body.standard[0],
        note: req.body.note,
        price: req.body.price,
        samplingDateTime: formattedDateTime,
        filePath: `/uploads/${req.file.filename}`
      });

      if (req.body.samplingPoints) {
        const points = JSON.parse(req.body.samplingPoints) as string[];
        await inspectionService.addSamplingPoints(inspectionID, points);
      }

      await inspectionService.addGrainDetails(
        inspectionID, 
        jsonData.grains, 
        jsonData.imageURL
      );

      await connection.query('COMMIT'); // Commit the transaction

      res.status(201).json({
        message: 'Inspection created successfully',
        inspectionID,
        fileContents
      });
    } catch (error: unknown) {
      if (connection) await connection.query('ROLLBACK'); // Rollback if there's a connection
      console.error('Error:', error);
      const status = (error as Error).message.includes('file') ? 400 : 500;
      res.status(status).json({
        message: 'Error creating inspection',
        error: (error as Error).message
      });
    } finally {
      if (connection) connection.release(); // Ensure the connection is released
    }
});


export default router;
