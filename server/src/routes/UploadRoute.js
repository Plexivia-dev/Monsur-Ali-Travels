import { Router } from 'express';
import UploadController from '../controllers/UploadController.js';
import { uploadImage, uploadDocument } from '../middlewares/upload.middleware.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

const uploadRouter = Router();

uploadRouter.use(authenticateToken);

uploadRouter.post('/image', uploadImage.single('file'), UploadController.uploadSingleImage);
uploadRouter.post('/document', uploadDocument.single('file'), UploadController.uploadSingleDocument);

export default uploadRouter;
