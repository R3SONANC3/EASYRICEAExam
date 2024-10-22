import { Request } from 'express';

export interface UploadedFile {
  file?: Express.Multer.File;
}

export interface InspectionBody {
  name: string;
  standard: string[];
  note?: string;
  price?: string; // เป็น string เพราะมาจาก form data
  samplingDateTime: string;
  samplingPoints?: string;
  grains?: string;
}

export type InspectionRequest = Request<{}, {}, InspectionBody> & UploadedFile;