export interface Standard {
    id: string;
    name: string;
}


export interface InspectionForm {
    name: string;
    note: string;
    standard:string;
    price?: number; 
    samplingPoints: any[]; 
    samplingDateTime: string;
    uploadFile?: File; 
}
