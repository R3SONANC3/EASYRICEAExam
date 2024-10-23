export interface GrainData {
  length: number;
  weight: number;
  shape: string;
  type: string;
}

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

export interface SubStandard {
  key: string;
  name: string;
  maxLength?: number;
  minLength?: number;
  conditionMax: 'LT' | 'LE' | 'GT' | 'GE';
  conditionMin: 'LT' | 'LE' | 'GT' | 'GE';
  shape: string[];
}

export interface Standard {
  id: string;
  name: string;
  createDate: string;
  standardData: SubStandard[];
}

// Result-related interfaces
export interface GrainClassification {
  shape: string;
  type: string;
  length: number;
  weight: number;
}

export interface StandardResult {
  name: string;
  percentage: number;
  lengthRange: string;
  grains: GrainClassification[];
}

export interface DefectResult {
  type: string;
  percentage: number;
}

export interface UnclassifiedResult {
  percentage: number;
  grains: GrainClassification[];
}

export interface InspectionResult {
  standardName: string;
  totalSamples: number;
  classifications: StandardResult[];
  unclassified: UnclassifiedResult;
  defects: DefectResult[];
}

// Database table interfaces
export interface RiceShape {
  id: number;
  name: string;
  code: 'wholegrain' | 'broken';
  description?: string;
}

export interface RiceType {
  id: number;
  name: string;
  code: 'white' | 'yellow' | 'red' | 'damage' | 'paddy' | 'chalky' | 'glutinous';
  description?: string;
}

export interface SamplingPoint {
  id: number;
  name: string;
  code: 'front_end' | 'back_end' | 'other';
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