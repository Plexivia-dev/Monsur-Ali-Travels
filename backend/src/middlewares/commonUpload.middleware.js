import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configure Multer Storage for general and document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Dynamic folder name from request query, body, or fallback to 'documents'
    const folder = (req.query.folder || req.body.folder || 'documents').replace(/[^a-zA-Z0-9_-]/g, '');
    
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Target directory: uploads/<folder>/<YYYY-MM>
    const targetDir = path.join(process.cwd(), 'uploads', folder, yearMonth);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    req.uploadRelativePath = `/uploads/${folder}/${yearMonth}`;
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
