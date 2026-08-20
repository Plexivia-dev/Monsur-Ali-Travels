import fs from 'fs';
import path from 'path';
import { processUploadedImage } from '../../middlewares/commonUpload.middleware.js';

class UploadController {
  /**
   * Upload a single file (image, PDF, doc, etc.)
   * Endpoint: POST /api/v1/upload/single
   */
  async uploadSingleFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'No file provided in request (use field name "file").'
        });
      }

      // Optimize image if it's an image file
      await processUploadedImage(req.file);

      // Construct file metadata & clean URL
      const relativeUrl = `${req.uploadRelativePath || '/uploads/documents'}/${req.file.filename}`;
      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const fullUrl = `${protocol}://${host}${relativeUrl}`;

      const fileData = {
        name: req.file.filename,
        originalName: req.file.originalname,
        url: relativeUrl,
        fullUrl: fullUrl,
        mimeType: req.file.mimetype,
        size: req.file.size,
        extension: path.extname(req.file.originalname),
        uploadedAt: new Date()
      };

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'File uploaded successfully.',
        data: fileData
      });
    } catch (error) {
      console.error('Single file upload error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to upload file.'
      });
    }
  }

  /**
   * Upload multiple files
   * Endpoint: POST /api/v1/upload/multiple
   */
  async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'No files provided in request (use field name "files").'
        });
      }

      // Process and optimize images in parallel
      await Promise.all(req.files.map(processUploadedImage));

      const host = req.get('host');
      const protocol = req.protocol || 'http';

      const uploadedFiles = req.files.map((file) => {
        const relativeUrl = `${req.uploadRelativePath || '/uploads/documents'}/${file.filename}`;
        return {
          name: file.filename,
          originalName: file.originalname,
          url: relativeUrl,
          fullUrl: `${protocol}://${host}${relativeUrl}`,
          mimeType: file.mimetype,
          size: file.size,
          extension: path.extname(file.originalname),
          uploadedAt: new Date()
        };
      });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: `${uploadedFiles.length} file(s) uploaded successfully.`,
        data: uploadedFiles
      });
    } catch (error) {
      console.error('Multiple files upload error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to upload files.'
      });
    }
  }

  /**
   * Upload Base64 Data URL to Disk File
   * Endpoint: POST /api/v1/upload/base64
   */
  async uploadBase64(req, res) {
    try {
      const { base64Data, filename, folder = 'documents' } = req.body;

      if (!base64Data) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'base64Data string is required.'
        });
      }

      // Parse mime type and buffer from data URL (e.g. data:image/png;base64,iVBORw0KGgo...)
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let mimeType = 'application/octet-stream';
      let buffer;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      // Determine file extension
      let ext = '.png';
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
      else if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('pdf')) ext = '.pdf';
      else if (filename && path.extname(filename)) ext = path.extname(filename);

      const cleanFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const targetDir = path.join(process.cwd(), 'uploads', cleanFolder, yearMonth);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const cleanName = (filename ? path.basename(filename, path.extname(filename)) : 'upload')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .substring(0, 50);
      const finalFilename = `${cleanName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
      const filePath = path.join(targetDir, finalFilename);

      await fs.promises.writeFile(filePath, buffer);

      const relativeUrl = `/uploads/${cleanFolder}/${yearMonth}/${finalFilename}`;
      const host = req.get('host');
      const protocol = req.protocol || 'http';

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Base64 file converted and saved successfully.',
        data: {
          name: finalFilename,
          originalName: filename || finalFilename,
          url: relativeUrl,
          fullUrl: `${protocol}://${host}${relativeUrl}`,
          mimeType: mimeType,
          size: buffer.length,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Base64 upload error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to process base64 file.'
      });
    }
  }

  /**
   * Delete uploaded file
   * Endpoint: DELETE /api/v1/upload
   */
  async deleteFile(req, res) {
    try {
      const { fileUrl, filePath } = req.body;
      const targetPath = filePath || fileUrl;

      if (!targetPath) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'fileUrl or filePath is required.'
        });
      }

      // Security check: ensure path is within uploads directory
      const cleanRelative = targetPath.replace(/^[/\\]+/, '').replace(/^uploads[/\\]/, '');
      const absolutePath = path.join(process.cwd(), 'uploads', cleanRelative);

      if (!absolutePath.startsWith(path.join(process.cwd(), 'uploads'))) {
        return res.status(403).json({
          success: false,
          status: 'error',
          message: 'Unauthorized path traversal attempt.'
        });
      }

      if (fs.existsSync(absolutePath)) {
        await fs.promises.unlink(absolutePath);
        return res.status(200).json({
          success: true,
          status: 'success',
          message: 'File deleted successfully from disk.'
        });
      } else {
        return res.status(404).json({
          success: false,
          status: 'error',
          message: 'File does not exist or was already deleted.'
        });
      }
    } catch (error) {
      console.error('Delete file error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to delete file.'
      });
    }
  }
}

export default new UploadController();
