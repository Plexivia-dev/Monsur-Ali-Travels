import fs from 'fs';
import path from 'path';
import { processUploadedImage } from '../../middlewares/commonUpload.middleware.js';
import {
  isR2Configured,
  uploadToR2,
  getPresignedUploadUrl,
  getPresignedViewUrl,
  deleteFromR2,
} from '../../utils/r2.util.js';

class UploadController {
  /**
   * Upload a single file (image, PDF, doc, etc.)
   * Endpoint: POST /api/v1/upload/single
   */
  async uploadSingleFile(req, res) {
    try {
      const file = req.file || (req.files && (Array.isArray(req.files) ? req.files[0] : (req.files.file?.[0] || req.files.image?.[0] || req.files.avatar?.[0] || req.files.photo?.[0])));
      if (!file) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'No file provided in request (use field name "file" or "image").'
        });
      }
      req.file = file;

      // Optimize image if it's an image file
      await processUploadedImage(req.file);

      // Construct file metadata & clean URL
      const relativeUrl = `${req.uploadRelativePath || '/uploads/documents'}/${req.file.filename}`;
      const host = req.get('host');
      const protocol = req.protocol || 'http';
      const fullUrl = `${protocol}://${host}${relativeUrl}`;

      let r2Data = null;
      if (isR2Configured() && req.file.path && fs.existsSync(req.file.path)) {
        try {
          const fileBuffer = await fs.promises.readFile(req.file.path);
          const subPath = req.uploadSubPath || (req.uploadRelativePath || '').replace(/^\/+uploads\/+/, '').replace(/^\/+documents\/+/, '');
          const r2Key = `${subPath}/${req.file.filename}`;

          r2Data = await uploadToR2({
            fileBuffer,
            key: r2Key,
            contentType: req.file.mimetype,
            metadata: {
              originalName: encodeURIComponent(req.file.originalname),
            },
          });
        } catch (r2Err) {
          console.warn('R2 sync warning (falling back to disk URL):', r2Err.message);
        }
      }

      const fileData = {
        name: req.file.filename,
        originalName: req.file.originalname,
        url: r2Data?.publicUrl || relativeUrl,
        fullUrl: r2Data?.publicUrl || fullUrl,
        r2Key: r2Data?.key || null,
        r2Bucket: r2Data?.bucket || null,
        storage: r2Data ? 'r2' : 'local',
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
      const cleanFolder = (req.query.folder || 'documents').replace(/[^a-zA-Z0-9_-]/g, '');
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const uploadedFiles = await Promise.all(
        req.files.map(async (file) => {
          const relativeUrl = `${req.uploadRelativePath || '/uploads/documents'}/${file.filename}`;
          let r2Data = null;

          if (isR2Configured() && file.path && fs.existsSync(file.path)) {
            try {
              const fileBuffer = await fs.promises.readFile(file.path);
              const subPath = req.uploadSubPath || (req.uploadRelativePath || '').replace(/^\/+uploads\/+/, '').replace(/^\/+documents\/+/, '');
              const r2Key = `${subPath}/${file.filename}`;
              r2Data = await uploadToR2({
                fileBuffer,
                key: r2Key,
                contentType: file.mimetype,
                metadata: { originalName: encodeURIComponent(file.originalname) },
              });
            } catch (r2Err) {
              console.warn('R2 sync warning:', r2Err.message);
            }
          }

          return {
            name: file.filename,
            originalName: file.originalname,
            url: relativeUrl,
            fullUrl: `${protocol}://${host}${relativeUrl}`,
            r2Key: r2Data?.key || null,
            r2Bucket: r2Data?.bucket || null,
            storage: r2Data ? 'r2' : 'local',
            mimeType: file.mimetype,
            size: file.size,
            extension: path.extname(file.originalname),
            uploadedAt: new Date()
          };
        })
      );

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
   * Upload Base64 Data URL to Disk File & R2
   * Endpoint: POST /api/v1/upload/base64
   */
  async uploadBase64(req, res) {
    try {
      const { base64Data, filename, clientId, documentType, folder } = req.body;

      if (!base64Data) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'base64Data string is required.'
        });
      }

      // Parse mime type and buffer from data URL
      const matches = base64Data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      let mimeType = 'application/octet-stream';
      let buffer;

      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64Data, 'base64');
      }

      let ext = '.png';
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = '.jpg';
      else if (mimeType.includes('png')) ext = '.png';
      else if (mimeType.includes('webp')) ext = '.webp';
      else if (mimeType.includes('pdf')) ext = '.pdf';
      else if (filename && path.extname(filename)) ext = path.extname(filename);

      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const dateFolder = `${yy}${mm}${dd}`;

      let subPathParts = [];
      if (clientId) {
        const cleanClientId = String(clientId).replace(/[^a-zA-Z0-9_-]/g, '');
        subPathParts = ['clients', cleanClientId, dateFolder];
      } else if (documentType) {
        const cleanDocType = String(documentType).replace(/[^a-zA-Z0-9_-]/g, '');
        subPathParts = ['other', cleanDocType, dateFolder];
      } else if (folder) {
        const cleanFolder = String(folder).replace(/[^a-zA-Z0-9_/-]/g, '');
        subPathParts = cleanFolder.split('/').filter(Boolean);
        if (!subPathParts.includes(dateFolder)) {
          subPathParts.push(dateFolder);
        }
      } else {
        subPathParts = ['other', 'general', dateFolder];
      }

      const targetDir = path.join(process.cwd(), 'uploads', ...subPathParts);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const cleanName = (filename ? path.basename(filename, path.extname(filename)) : 'upload')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .substring(0, 50);
      const finalFilename = `${cleanName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
      const filePath = path.join(targetDir, finalFilename);

      await fs.promises.writeFile(filePath, buffer);

      const subPath = subPathParts.join('/');
      const relativeUrl = `/uploads/${subPath}/${finalFilename}`;
      const host = req.get('host');
      const protocol = req.protocol || 'http';

      let r2Data = null;
      if (isR2Configured()) {
        try {
          const r2Key = `${subPath}/${finalFilename}`;
          r2Data = await uploadToR2({
            fileBuffer: buffer,
            key: r2Key,
            contentType: mimeType,
          });
        } catch (r2Err) {
          console.warn('R2 base64 upload warning:', r2Err.message);
        }
      }

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Base64 file converted and saved successfully.',
        data: {
          name: finalFilename,
          originalName: filename || finalFilename,
          url: relativeUrl,
          fullUrl: `${protocol}://${host}${relativeUrl}`,
          r2Key: r2Data?.key || null,
          r2Bucket: r2Data?.bucket || null,
          storage: r2Data ? 'r2' : 'local',
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
   * Get Presigned Upload URL for direct R2 upload
   * Endpoint: POST /api/v1/upload/presigned-upload
   */
  async getPresignedUpload(req, res) {
    try {
      if (!isR2Configured()) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Cloudflare R2 is not configured on this server.'
        });
      }

      const { clientId, documentType, folder, filename, contentType = 'application/octet-stream', expiresIn = 300 } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'filename is required.'
        });
      }

      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const dateFolder = `${yy}${mm}${dd}`;

      let subPathParts = [];
      if (clientId) {
        const cleanClientId = String(clientId).replace(/[^a-zA-Z0-9_-]/g, '');
        subPathParts = ['clients', cleanClientId, dateFolder];
      } else if (documentType) {
        const cleanDocType = String(documentType).replace(/[^a-zA-Z0-9_-]/g, '');
        subPathParts = ['other', cleanDocType, dateFolder];
      } else if (folder) {
        const cleanFolder = String(folder).replace(/[^a-zA-Z0-9_/-]/g, '');
        subPathParts = cleanFolder.split('/').filter(Boolean);
        if (!subPathParts.includes(dateFolder)) {
          subPathParts.push(dateFolder);
        }
      } else {
        subPathParts = ['other', 'general', dateFolder];
      }

      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '-').substring(0, 50);
      const finalFilename = `${baseName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;
      const key = `${subPathParts.join('/')}/${finalFilename}`;

      const presigned = await getPresignedUploadUrl({
        key,
        contentType,
        expiresIn: Number(expiresIn) || 300,
      });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Presigned upload URL generated successfully.',
        data: {
          uploadUrl: presigned.uploadUrl,
          key: presigned.key,
          bucket: presigned.bucket,
          filename: finalFilename,
          originalName: filename,
          contentType,
          expiresIn: presigned.expiresIn,
        }
      });
    } catch (error) {
      console.error('Presigned upload URL error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to generate presigned upload URL.'
      });
    }
  }

  /**
   * Get Presigned View / Download URL for secure private document access
   * Endpoint: POST /api/v1/upload/presigned-view
   */
  async getPresignedView(req, res) {
    try {
      if (!isR2Configured()) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'Cloudflare R2 is not configured on this server.'
        });
      }

      const { key, fileUrl, expiresIn = 900 } = req.body;
      let targetKey = key;

      if (!targetKey && fileUrl) {
        targetKey = fileUrl.replace(/^[/\\]+/, '').replace(/^uploads[/\\]/, '');
      }

      if (!targetKey) {
        return res.status(400).json({
          success: false,
          status: 'error',
          message: 'key or fileUrl is required.'
        });
      }

      const presigned = await getPresignedViewUrl({
        key: targetKey,
        expiresIn: Number(expiresIn) || 900,
      });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Presigned view URL generated successfully.',
        data: presigned
      });
    } catch (error) {
      console.error('Presigned view URL error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to generate presigned view URL.'
      });
    }
  }

  /**
   * Delete uploaded file (from Disk & Cloudflare R2)
   * Endpoint: DELETE /api/v1/upload
   */
  async deleteFile(req, res) {
    try {
      const { fileUrl, filePath, key, r2Key } = req.body;
      const targetPath = filePath || fileUrl;
      const targetR2Key = r2Key || key || (targetPath ? targetPath.replace(/^[/\\]+/, '').replace(/^uploads[/\\]/, '') : null);

      let deletedFromR2 = false;
      let deletedFromDisk = false;

      // 1. Delete from R2 if configured
      if (isR2Configured() && targetR2Key) {
        try {
          await deleteFromR2({ key: targetR2Key });
          deletedFromR2 = true;
        } catch (r2Err) {
          console.warn('R2 delete warning:', r2Err.message);
        }
      }

      // 2. Delete from local disk
      if (targetPath) {
        const cleanRelative = targetPath.replace(/^[/\\]+/, '').replace(/^uploads[/\\]/, '');
        const absolutePath = path.join(process.cwd(), 'uploads', cleanRelative);

        if (absolutePath.startsWith(path.join(process.cwd(), 'uploads')) && fs.existsSync(absolutePath)) {
          await fs.promises.unlink(absolutePath);
          deletedFromDisk = true;
        }
      }

      if (!deletedFromR2 && !deletedFromDisk) {
        return res.status(404).json({
          success: false,
          status: 'error',
          message: 'File not found or already deleted.'
        });
      }

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'File deleted successfully.',
        data: {
          deletedFromR2,
          deletedFromDisk,
        }
      });
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
