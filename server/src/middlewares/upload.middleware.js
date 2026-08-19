import multer from 'multer';
import path from 'path';
import fs from 'fs';
import env from '../config/env.js';

// Ensure base upload directories exist
const uploadBase = path.resolve(env.UPLOAD_PATH);
const documentBase = path.resolve(env.DOCUMENT_PATH);

if (!fs.existsSync(uploadBase)) fs.mkdirSync(uploadBase, { recursive: true });
if (!fs.existsSync(documentBase)) fs.mkdirSync(documentBase, { recursive: true });

/**
 * Storage engine for images with date-based subfolders (YYMMDD)
 */
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const subfolder = `${yy}${mm}${dd}`;
    const targetDir = path.join(uploadBase, subfolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

/**
 * Storage engine for PDFs and generic documents with date-based subfolders
 */
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const subfolder = `${yy}${mm}${dd}`;
    const targetDir = path.join(documentBase, subfolder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `doc-${uniqueSuffix}-${sanitizedName}`);
  },
});

const maxSizeBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;

export const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: maxSizeBytes },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image file type. Only JPEG, PNG, WEBP and GIF are allowed.'));
    }
  },
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: maxSizeBytes },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid document file type. Only PDF, DOCX, and images are allowed.'));
    }
  },
});

export default { uploadImage, uploadDocument };
