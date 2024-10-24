import { Pool, ResultSetHeader, RowDataPacket, PoolConnection } from 'mysql2/promise';
import { InspectionData, GrainData, DBInspectionData } from '../types/index';

interface CreateInspectionWithDetailsParams {
  inspection: InspectionData;
  samplingPoints?: string[];
  grainData: GrainData[];
  imageURL: string;
}


export class InspectionService {
  constructor(
    private pool: Pool,
    private maxRetries: number = 3,
    private initialRetryDelay: number = 1000
  ) { }

  async createInspectionWithDetails(params: CreateInspectionWithDetailsParams): Promise<number> {
    const inspectionID = await this.withRetry(async () => {
      return await this.executeTransaction(async (connection) => {
        try {
          // Step 1: Create inspection
          const inspectionID = await this.createInspectionInternal(connection, params.inspection);

          // Step 2: Add sampling points if provided
          if (params.samplingPoints?.length) {
            await this.addSamplingPointsInternal(connection, inspectionID, params.samplingPoints);
          }

          // Step 3: Add grain details
          await this.addGrainDetailsInternal(
            connection,
            inspectionID,
            params.grainData,
            params.imageURL
          );

          return inspectionID;
        } catch (error) {
          console.error('Transaction failed:', error);
          await connection.rollback();
          throw error;
        }
      });
    });

    return inspectionID;
  }

  private async createInspectionInternal(
    connection: PoolConnection,
    data: InspectionData
  ): Promise<number> {
    const dbData = this.convertToDBData(data);
    const [result] = await connection.query<ResultSetHeader>(
      `INSERT INTO inspections 
        (name, standardID, note, price, samplingDate, rawDataPath)
      VALUES (?, ?, ?, ?, CONVERT_TZ(?, '+00:00', '+07:00'), ?)`,
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
  }

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
    let isRolledBack = false;

    try {
      await connection.beginTransaction();
      const result = await operations(connection);
      await connection.commit();
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      if (!isRolledBack) {
        try {
          await connection.rollback();
          isRolledBack = true;
        } catch (rollbackError) {
          console.error('Rollback failed:', rollbackError);
          throw rollbackError;
        }
      }
      throw error;
    } finally {
      try {
        connection.release();
      } catch (releaseError) {
        console.error('Connection release failed:', releaseError);
        throw releaseError;
      }
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
    try {
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
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  }

  private async addSamplingPointsInternal(
    connection: PoolConnection,
    inspectionID: number,
    points: string[]
  ): Promise<void> {
    const pointIDs = await Promise.all(
      points.map(async (point) => {
        const [rows] = await connection.query<RowDataPacket[]>(
          'SELECT id FROM samplingPoints WHERE name = ?',
          [point]
        );
        return rows[0]?.id;
      })
    );

    const validPointIDs = pointIDs.filter((id): id is number => id !== null && id !== undefined);

    if (validPointIDs.length !== points.length) {
      throw new Error('Some sampling points were not found in the database');
    }

    await Promise.all(
      validPointIDs.map(pointID =>
        connection.query(
          'INSERT INTO inspectionSamplingPoints (inspectionID, samplingPointID) VALUES (?, ?)',
          [inspectionID, pointID]
        )
      )
    );
  }

  private async addGrainDetailsInternal(
    connection: PoolConnection,
    inspectionID: number,
    grains: GrainData[],
    imageURL: string
  ): Promise<void> {
    if (!grains?.length) {
      throw new Error('No grain data provided');
    }
  
    console.log(`Processing ${grains.length} grains for inspection ${inspectionID}`);
  
    const uniqueShapes = [...new Set(grains.map((g) => g.shape))];
    const uniqueTypes = [...new Set(grains.map((g) => g.type))];
  
    const { shapeMap, typeMap } = await this.getRiceCodeMappings(
      connection,
      uniqueShapes,
      uniqueTypes
    );
  
    // Filter out grains with missing mappings instead of throwing an error
    const validGrains = grains.filter((grain) => {
      const hasValidShape = shapeMap.has(grain.shape);
      const hasValidType = typeMap.has(grain.type);
      if (!hasValidShape || !hasValidType) {
        console.log(`Skipping grain with invalid shape: ${grain.shape} or type: ${grain.type}`);
      }
      return hasValidShape && hasValidType;
    });
  
    if (validGrains.length === 0) {
      console.warn('No valid grains found after filtering');
      return;
    }
  
    console.log(`Processing ${validGrains.length} valid grains out of ${grains.length} total grains`);
  
    const BATCH_SIZE = 100;
    for (let i = 0; i < validGrains.length; i += BATCH_SIZE) {
      const batch = validGrains.slice(i, i + BATCH_SIZE);
  
      const values = batch
        .map((grain) => [
          inspectionID,
          grain.length,
          grain.weight,
          shapeMap.get(grain.shape)!,  // Non-null assertion is safe due to filtering
          typeMap.get(grain.type)!,    // Non-null assertion is safe due to filtering
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
        `Processed batch ${i / BATCH_SIZE + 1} of ${Math.ceil(validGrains.length / BATCH_SIZE)}`
      );
    }
  
    await connection.query(
      `UPDATE inspections 
       SET imagePath = ?, createdAt = CONVERT_TZ(NOW(), '+00:00', '+07:00'),
       updatedAt = CONVERT_TZ(NOW(), '+00:00', '+07:00')
       WHERE id = ?`,
      [imageURL, inspectionID]
    );
  
    console.log(`Successfully processed ${validGrains.length} valid grains for inspection ${inspectionID}`);
  }
}