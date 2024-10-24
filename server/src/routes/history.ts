import express, { Request, Response, NextFunction } from 'express';
import pool from '../services/db';
import { RowDataPacket, FieldPacket } from 'mysql2';
import { upload, readUploadedFile } from '../services/fileService';
import { InspectionService } from '../services/inspectionService';
import { InspectionRequest } from '../types/express';
import { InspectionPayload } from '../types';

const router = express.Router();

interface InspectionData extends RowDataPacket {
    id: number;
    name: string;
    createdAt: Date;
    standardName: string;
    note: string;
    totalSamples: number;
}

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
        `, [id]);
        res.json({ data: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: (err as Error).message });
    }
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = req.params.id.split(',');

    if (!Array.isArray(id) || id.length === 0) {
        res.status(400).json({ error: 'Invalid input: ids must be a non-empty array.' });
    }


    const tables = [
        'inspectionSamplingPoints',
        'grainDetails',
    ];

    try {
        await Promise.all(
            tables.map(table =>
                Promise.all(id.map(id =>
                    pool.query(`DELETE FROM ?? WHERE inspectionID = ?`, [table, id])
                ))
            )
        );

        // Delete the inspections
        await Promise.all(id.map(id =>
            pool.query(`DELETE FROM inspections WHERE id = ?`, [id])
        ));

        res.status(200).json({ message: `Inspections with IDs ${id.join(', ')} have been deleted.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: (error as Error).message });
    }
});

router.post('/',
    upload.single('uploadFile'),
    validateFileUpload,
    validateFields,
    async (req: InspectionRequest, res: Response): Promise<void> => {
        // Remove connection handling from router since it's managed in service layer
        try {
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

            // Create a new transaction wrapper in the service layer
            const inspectionID = await inspectionService.createInspectionWithDetails({
                inspection: {
                    name: req.body.name,
                    standardID: req.body.standard[0],
                    note: req.body.note,
                    price: req.body.price,
                    samplingDateTime: formattedDateTime,
                    filePath: `/uploads/${req.file.filename}`
                },
                samplingPoints: req.body.samplingPoints ? JSON.parse(req.body.samplingPoints) as string[] : undefined,
                grainData: jsonData.grains,
                imageURL: jsonData.imageURL
            });

            res.status(201).json({
                message: 'Inspection created successfully',
                fileContents,
                inspectionID
            });
        } catch (error: unknown) {
            console.error('Error:', error);
            const status = (error as Error).message.includes('file') ? 400 : 500;
            res.status(status).json({
                message: 'Error creating inspection',
                error: (error as Error).message
            });
        }
    }
);

export default router;
