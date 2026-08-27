import { Router } from 'express';
import UploadController from '../../controllers/shared/UploadController.js';
import { commonMulter } from '../../middlewares/commonUpload.middleware.js';

const uploadRouter = Router();

// Middleware to support flexible field names ('file', 'image', 'avatar', 'photo', 'document')
const handleSingleUpload = (req, res, next) => {
  commonMulter.any()(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

// 1. Single File Upload (field name: 'file', 'image', 'avatar', etc.)
// POST /api/v1/upload/single?folder=documents
uploadRouter.post('/single', handleSingleUpload, (req, res) => {
  UploadController.uploadSingleFile(req, res);
});

// Image Upload Alias: POST /api/v1/upload/image or POST /api/v1/uploads/image
uploadRouter.post('/image', handleSingleUpload, (req, res) => {
  UploadController.uploadSingleFile(req, res);
});

// Avatar Upload Alias: POST /api/v1/upload/avatar or POST /api/v1/uploads/avatar
uploadRouter.post('/avatar', handleSingleUpload, (req, res) => {
  UploadController.uploadSingleFile(req, res);
});

// Document Upload Alias: POST /api/v1/upload/document or POST /api/v1/uploads/document
uploadRouter.post('/document', handleSingleUpload, (req, res) => {
  UploadController.uploadSingleFile(req, res);
});

// 2. Multiple Files Upload (field name: 'files', max 20 files)
// POST /api/v1/upload/multiple?folder=documents
uploadRouter.post('/multiple', commonMulter.array('files', 20), (req, res) => {
  UploadController.uploadMultipleFiles(req, res);
});

// 3. Base64 String to File Upload
// POST /api/v1/upload/base64
uploadRouter.post('/base64', (req, res) => {
  UploadController.uploadBase64(req, res);
});

// 4. Generate Presigned Upload URL (for direct client upload to R2)
// POST /api/v1/upload/presigned-upload
uploadRouter.post('/presigned-upload', (req, res) => {
  UploadController.getPresignedUpload(req, res);
});

// 5. Generate Presigned View / Download URL (for secure time-limited view)
// POST /api/v1/upload/presigned-view
uploadRouter.post('/presigned-view', (req, res) => {
  UploadController.getPresignedView(req, res);
});

// 6. Delete File from Server Disk / Cloudflare R2
// DELETE /api/v1/upload
uploadRouter.delete('/', (req, res) => {
  UploadController.deleteFile(req, res);
});

export default uploadRouter;
