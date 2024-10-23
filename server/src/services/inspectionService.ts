import { Pool, ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import { InspectionData, GrainData, DBInspectionData } from '../types/index';

export class InspectionService {
  constructor(
    private pool: Pool,
    private maxRetries: number = 3,
    private initialRetryDelay: number = 1000
  ) { }

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

  private async withRetry<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (
        error.code === 'ER_LOCK_WAIT_TIMEOUT' &&
        retryCount < this.maxRetries
      ) {
        const delay = this.initialRetryDelay * Math.pow(2, retryCount);
        console.log(`Retry attempt ${retryCount + 1} after ${delay}ms delay`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(operation, retryCount + 1);
      }
      throw error;
    }
  }

  private async executeTransaction<T>(
    operations: (connection: PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();

    try {
      const result = await operations(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async getRiceCodeMappings(
    connection: PoolConnection,
    shapes: string[],
    types: string[]
  ): Promise<{
    shapeMap: Map<string, number>,
    typeMap: Map<string, number>
  }> {
    // Fetch all relevant shape IDs
    const [shapeRows] = await connection.query<RowDataPacket[]>(
      'SELECT id, code FROM riceShapes WHERE code IN (?)',
      [shapes]
    );

    // Fetch all relevant type IDs
    const [typeRows] = await connection.query<RowDataPacket[]>(
      'SELECT id, code FROM riceTypes WHERE code IN (?)',
      [types]
    );

    // Create mappings
    const shapeMap = new Map(shapeRows.map(row => [row.code, row.id]));
    const typeMap = new Map(typeRows.map(row => [row.code, row.id]));

    return { shapeMap, typeMap };
  }

  async addGrainDetails(
    inspectionID: number,
    grains: GrainData[],
    imageURL: string
  ): Promise<void> {
    if (!grains?.length) {
      throw new Error('No grain data provided');
    }

    console.log(`Processing ${grains.length} grains for inspection ${inspectionID}`);

    await this.withRetry(async () => {
      await this.executeTransaction(async (connection) => {
        const uniqueShapes = [...new Set(grains.map((g) => g.shape))];
        const uniqueTypes = [...new Set(grains.map((g) => g.type))];

        const { shapeMap, typeMap } = await this.getRiceCodeMappings(
          connection,
          uniqueShapes,
          uniqueTypes
        );

        const missingShapes = uniqueShapes.filter((shape) => !shapeMap.has(shape));
        const missingTypes = uniqueTypes.filter((type) => !typeMap.has(type));

        if (missingShapes.length > 0 || missingTypes.length > 0) {
          console.warn(
            `Missing mappings for shapes: [${missingShapes.join(', ')}] and types: [${missingTypes.join(', ')}]. Skipping these grains.`
          );
          return;
        }


        const BATCH_SIZE = 100;
        for (let i = 0; i < grains.length; i += BATCH_SIZE) {
          const batch = grains.slice(i, i + BATCH_SIZE);
        

          const values = batch
          .map((grain) => [
            inspectionID,
            grain.length,
            grain.weight,
            shapeMap.get(grain.shape) ?? null,
            typeMap.get(grain.type) ?? null,
          ])
          .flat();
        

          const placeholders = batch.map(() => '(?, ?, ?, ?, ?)').join(',');

          await connection.query(
            `INSERT INTO grainDetails 
             (inspectionID, length, weight, shapeID, riceTypeID) 
             VALUES ${placeholders}`,
            values
          );

          console.log(
            `Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(grains.length / BATCH_SIZE)}`
          );
        }

        // Update the inspection record with the provided image URL and current timestamp
        await connection.query(
          `UPDATE inspections 
           SET imagePath = ?, createdAt = NOW() 
           WHERE id = ?`,
          [imageURL, inspectionID]
        );

        console.log(`Successfully processed all grains for inspection ${inspectionID}`);
      });
    });
  }

  async createInspection(data: InspectionData): Promise<number> {
    const dbData = this.convertToDBData(data);

    return await this.withRetry(async () => {
      return await this.executeTransaction(async (connection) => {
        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO inspections 
           (name, standardID, note, price, samplingDate, rawDataPath)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            dbData.name,
            dbData.standardID,
            dbData.note,
            dbData.price,
            dbData.samplingDateTime,
            dbData.filePath,
          ]
        );
        return result.insertId;
      });
    });
  }

  async addSamplingPoints(inspectionID: number, points: string[]): Promise<void> {
    await this.withRetry(async () => {
      await this.executeTransaction(async (connection) => {
        const pointIDs = await Promise.all(
          points.map(async (point) => {
            const [rows] = await connection.query<RowDataPacket[]>(
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
              connection.query(
                'INSERT INTO inspectionSamplingPoints (inspectionID, samplingPointID) VALUES (?, ?)',
                [inspectionID, pointID]
              )
            )
        );
      });
    });
  }

}