export interface Standard {
    id: string;
    name: string;
    createDate: string;
    description?: string;
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
    id: string;
    name: string;
    standardId: string;
    note?: string;
    price?: number;
    samplingDatetime?: string;
    samplingPoints?: ('front_end' | 'back_end' | 'other')[];
    createdAt: string;
    updatedAt: string;
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
    defects: {
        name: string;
        actual: number;
    }[];
}

export interface GrainDetail {
    length: number;
    weight: number;
    shape: 'wholegrain' | 'broken';
    type: 'white' | 'yellow' | 'red' | 'damage' | 'paddy' | 'chalky' | 'glutinous';
}