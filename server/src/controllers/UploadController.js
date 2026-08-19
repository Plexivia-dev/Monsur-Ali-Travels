import path from 'path';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UploadController {
  /**
   * Handles single image upload
   */
  static async uploadSingleImage(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, { statusCode: 400, message: 'No image file uploaded' });
      }

      // Compute relative URL
      const relativePath = path.relative(path.resolve('./uploads'), req.file.path).replace(/\\/g, '/');
      const fileUrl = `/uploads/${relativePath}`;

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles document / PDF upload
   */
  static async uploadSingleDocument(req, res, next) {
    try {
      if (!req.file) {
        return sendError(res, { statusCode: 400, message: 'No document file uploaded' });
      }

      const relativePath = path.relative(path.resolve('./documents'), req.file.path).replace(/\\/g, '/');
      const fileUrl = `/documents/${relativePath}`;

      return sendSuccess(res, {
        statusCode: 201,
        message: 'Document uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default UploadController;
