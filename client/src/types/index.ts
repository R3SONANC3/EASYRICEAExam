export interface DefectData {
    type: string;
    percentage: number;
}

export interface Standard {
    id: string;
    name: string;
    description?: string;
}

export interface FetchParams {
    page: number;
    limit: number;
    fromDate?: string;
    toDate?: string;
}

export interface SubStandard {
    id: string;
    standardId: string;
    keyName: string;
    name: string;
    maxLength: number;
    minLength: number;
    conditionMax: 'LT' | 'LE' | 'GT' | 'GE';
    conditionMin: 'LT' | 'LE' | 'GT' | 'GE';
}

export interface Inspection {
    id: any;
    name: string;
    standardId: string;
    standardName?: string;
    note?: string;
    price?: number;
    samplingDatetime?: string;
    samplingPoints?: ('front_end' | 'back_end' | 'other')[];
    createdAt?: any;
    updatedAt?: string;
    totalSamples?: number;
    imagePath?: string;
    rawDataPath?: string;
}

export interface InspectionResult {
    compositions: {
        name: string;
        length: string;
        actual: number;
    }[];
    defects: DefectData[];
    classifications: Classification[];
    standardName: string;
    totalSamples: number;
    unclassified: UnclassifiedData;
}

export interface GrainDetail {
    length: number;
    weight: number;
    shape: 'wholegrain' | 'broken';
    type: 'white' | 'yellow' | 'red' | 'damage' | 'paddy' | 'chalky' | 'glutinous';
}

export interface InspectionForm {
    id?: string;
    name: string;
    note: string;
    standard: string;
    standardID?: string;
    price?: number;
    samplingPoints: any[];
    samplingDateTime: string;
    uploadFile?: File;
}

export interface ResultData {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
    samplingDate: string;
    note: string;
    price: string;
    totalSamples: number;
    imagePath: string;
    standardName: string;
    samplingPoints: string;
}

export interface InspectionResponse {
    inspection: ResultData;
    standard: any;
    results: InspectionResult;
}

export interface Classification {
    name: string;
    percentage: number;
    lengthRange: string;
}

export interface UnclassifiedData {
    percentage: number;
    grains: number;
}

export interface CompositionData {
    classifications: Classification[];
    defects: DefectData[];
    standardName: string;
    totalSamples: number;
    unclassified: UnclassifiedData;
}

export interface CompositionProps {
    composition: CompositionData;
}

export interface DefectData {
    type: string;
    percentage: number;
}


export interface FormErrors {
    name?: string;
    standardId?: string;
    price?: string;
    samplingDatetime?: string;
    samplingPoints?: string;
    submit?: string;
}