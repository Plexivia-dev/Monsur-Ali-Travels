import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configure Multer Storage with dynamic daily folders:
// Images => uploads/YYMMDD/ (or uploads/<folder>/YYMMDD)
// Documents => documents/YYMMDD/ (or uploads/documents/YYMMDD)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isDocument = file.mimetype?.includes('pdf') ||
      file.mimetype?.includes('word') ||
      file.mimetype?.includes('excel') ||
      file.mimetype?.includes('spreadsheet') ||
      file.mimetype?.includes('text') ||
      file.mimetype?.includes('csv') ||
      req.query.type === 'document' ||
      req.body.type === 'document';

    // Root folder: 'documents' or 'uploads'
    const defaultRoot = isDocument ? 'documents' : 'uploads';
    const subFolder = (req.query.folder || req.body.folder || '').replace(/[^a-zA-Z0-9_-]/g, '');

    // 6-digit YYMMDD date format (e.g. 260817)
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateFolder = `${yy}${mm}${dd}`;

    const folderParts = [process.cwd(), defaultRoot];
    if (subFolder) folderParts.push(subFolder);
    folderParts.push(dateFolder);

    const targetDir = path.join(...folderParts);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const relParts = [`/${defaultRoot}`];
    if (subFolder) relParts.push(subFolder);
    relParts.push(dateFolder);

    req.uploadRelativePath = relParts.join('/');
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .substring(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const finalFilename = `${baseName}-${uniqueSuffix}${ext}`;

    cb(null, finalFilename);
  }
});

// File filter supporting standard documents & images
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'image/gif',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: Images, PDF, Word, Excel, CSV, Text.`), false);
  }
};

export const commonMulter = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB max file size
  }
});

// Optional Sharp optimization for uploaded image files
export const processUploadedImage = async (file) => {
  if (!file || !file.path || !file.mimetype?.startsWith('image/')) return;
  // Skip SVGs and GIFs
  if (file.mimetype.includes('svg') || file.mimetype.includes('gif')) return;

  try {
    const buffer = await sharp(file.path)
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside',
        withoutEnlargement: true
      })
      .toBuffer();

    await fs.promises.writeFile(file.path, buffer);
  } catch (err) {
    // If sharp fails for any reason, continue with original file
    console.warn(`[Sharp Image Optimization] Notice: ${err.message}`);
  }
};
