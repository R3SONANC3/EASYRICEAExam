export interface InspectionData {
  name: string;
  standardID: string;
  note?: string;
  price?: string;
  samplingDateTime: string;
  filePath?: string;
  imageURL?: string;
}

export interface DBInspectionData {
  name: string;
  standardID: number;
  note?: string;
  price?: number;
  samplingDateTime: string;
  filePath?: string;
  imageURL?: string;
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


export interface Standard {
  id?: number;
  name: string;
  description?: string;
}

export interface SubStandard {
  id?: number;
  standardID: number;
  keyName: string;
  name: string;
  maxLength?: number;
  minLength?: number;
  conditionMax?: 'LT' | 'LE' | 'GT' | 'GE';
  conditionMin?: 'LT' | 'LE' | 'GT' | 'GE';
}
