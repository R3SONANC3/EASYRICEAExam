import fs from 'fs';
import path from 'path';
import multer from 'multer';

export const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadsDir),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

export const upload = multer({ storage });

export const readUploadedFile = (filePath: string): string => {
  return fs.readFileSync(filePath, 'utf8');
};