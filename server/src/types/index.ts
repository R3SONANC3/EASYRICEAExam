export interface InspectionData {
  name: string;
  standardID: string;
  note?: string;
  price?: string;
  samplingDateTime: string;
  filePath?: string;
  imageURL?: string; // เพิ่ม imageURL
}

export interface DBInspectionData {
  name: string;
  standardID: number;
  note?: string;
  price?: number;
  samplingDateTime: string;
  filePath?: string;
  imageURL?: string; // เพิ่ม imageURL
}

export interface GrainData {
  length: number;
  weight: number;
  shape: string;
  type: string;
}

export interface InspectionPayload {
  requestID: string;
  imageURL: string;
  grains: Array<{
    length: number;
    weight: number;
    shape: string;
    type: string;
  }>;
}
