import sharp from 'sharp';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

let globalProductCount = 0;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const batchNumber = Math.floor(globalProductCount / 50) + 1;

    const now = new Date();
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // 1. Folder Name
    const folderName = `${dateStr}-batch-${batchNumber}`;
    
    // 2. Absolute Path for Docker container safety
    const targetDir = path.join(process.cwd(), 'uploads/products', folderName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Save relative folder path for URL generation
    req.currentBatchPath = `/uploads/products/${folderName}`;
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    globalProductCount++;

    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    const uniqueName = `${nameWithoutExt}-${Date.now()}${ext}`;

    cb(null, uniqueName);
  }
});

const multerUpload = multer({ storage });

const compressImageFile = async (file) => {
  if (!file?.mimetype?.startsWith('image/')) return;

  const outputBuffer = await sharp(file.path)
    .rotate()
    .resize({
      width: 1000,
      height: 1000,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();

  await fs.promises.writeFile(file.path, outputBuffer);
};

export const upload = (fields) => {
  const middleware = Array.isArray(fields) 
    ? multerUpload.fields(fields) 
    : multerUpload.single(fields);

  return async (req, res, next) => {
    middleware(req, res, async (err) => {
      if (err) return next(err);

      try {
        const filesToProcess = [];

        if (req.file) {
          filesToProcess.push(req.file);
        }

        if (req.files) {
          Object.keys(req.files).forEach((key) => {
            req.files[key].forEach((file) => filesToProcess.push(file));
          });
        }

        // Image compression via Sharp
        await Promise.all(filesToProcess.map(compressImageFile));

        // Clean URL generation for DB storage
        if (req.file) {
          req.file.url = `${req.currentBatchPath}/${req.file.filename}`;
        }

        if (req.files) {
          Object.keys(req.files).forEach((key) => {
            req.files[key] = req.files[key].map((file) => {
              file.url = `${req.currentBatchPath}/${file.filename}`;
              return file;
            });
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    });
  };
};