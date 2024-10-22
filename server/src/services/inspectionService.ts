import { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { InspectionData, GrainData, DBInspectionData } from '../types/index';

export class InspectionService {
  constructor(private pool: Pool) {}

  private convertToDBData(data: InspectionData): DBInspectionData {
    return {
      name: data.name,
      standardID: parseInt(data.standardID, 10),
      note: data.note,
      price: data.price ? parseFloat(data.price) : undefined,
      samplingDateTime: data.samplingDateTime,
      filePath: data.filePath,
      imageURL: data.imageURL
    };
  }

  async createInspection(data: InspectionData): Promise<number> {
    const dbData = this.convertToDBData(data);
    const [result] = await this.pool.query<ResultSetHeader>(
      `INSERT INTO inspections 
       (name, standardID, note, price, createdAt, rawDataPath, imageURL)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        dbData.name,
        dbData.standardID,
        dbData.note,
        dbData.price,
        dbData.samplingDateTime,
        dbData.filePath,
        dbData.imageURL
      ]
    );
    return result.insertId;
  }

  async addSamplingPoints(inspectionID: number, points: string[]): Promise<void> {
    const pointIDs = await Promise.all(
      points.map(async (point) => {
        const [rows] = await this.pool.query<RowDataPacket[]>(
          'SELECT id FROM samplingPoints WHERE name = ?',
          [point]
        );
        return rows[0]?.id;
      })
    );

    await Promise.all(
      pointIDs
        .filter((id): id is number => id !== null && id !== undefined)
        .map(pointID =>
          this.pool.query(
            'INSERT INTO inspectionSamplingPoints (inspectionID, samplingPointID) VALUES (?, ?)',
            [inspectionID, pointID]
          )
        )
    );
  }

  async addGrainDetails(inspectionID: number, grains: GrainData[]): Promise<void> {
    // First, ensure all shape and type codes exist
    await this.ensureRiceCodesExist(grains);

    // Then insert grain details
    await Promise.all(
      grains.map(grain =>
        this.pool.query(
          `INSERT INTO grainDetails 
           (inspectionID, length, weight, shapeID, riceTypeID)
           VALUES (?, ?, ?, 
           (SELECT id FROM riceShapes WHERE code = ?), 
           (SELECT id FROM riceTypes WHERE code = ?))`,
          [inspectionID, grain.length, grain.weight, grain.shape, grain.type]
        )
      )
    );
  }

  private async ensureRiceCodesExist(grains: GrainData[]): Promise<void> {
    const uniqueShapes = [...new Set(grains.map(g => g.shape))];
    const uniqueTypes = [...new Set(grains.map(g => g.type))];

    // Insert missing shapes
    await Promise.all(
      uniqueShapes.map(shape =>
        this.pool.query(
          `INSERT IGNORE INTO riceShapes (code) VALUES (?)`,
          [shape]
        )
      )
    );

    // Insert missing types
    await Promise.all(
      uniqueTypes.map(type =>
        this.pool.query(
          `INSERT IGNORE INTO riceTypes (code) VALUES (?)`,
          [type]
        )
      )
    );
  }
}