import { Router } from 'express';
import UploadController from '../../controllers/shared/UploadController.js';
import { commonMulter } from '../../middlewares/commonUpload.middleware.js';

const uploadRouter = Router();

// 1. Single File Upload (field name: 'file')
// POST /api/v1/upload/single?folder=documents
uploadRouter.post('/single', commonMulter.single('file'), (req, res) => {
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

// 4. Delete File from Server Disk
// DELETE /api/v1/upload
uploadRouter.delete('/', (req, res) => {
  UploadController.deleteFile(req, res);
});

export default uploadRouter;
