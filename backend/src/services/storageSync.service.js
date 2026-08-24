import fs from 'fs';
import path from 'path';
import { generateDid } from '../utils/generateDid.js';
import {
  isR2Configured,
  uploadToR2,
  listAllR2Objects,
  deleteFromR2,
  deleteMultipleFromR2,
} from '../utils/r2.util.js';
import { OrphanCleanupBatchModel } from '../models/orphanCleanupBatch.model.js';
import { StorageSyncLogModel } from '../models/storageSyncLog.model.js';
import { NotificationModel } from '../models/notification.model.js';
import { SystemLogModel } from '../models/systemLog.model.js';
import { DocumentVaultModel } from '../models/documentVault.model.js';
import Client from '../models/client.model.js';
import { CandidateCaseFileModel } from '../models/candidateCaseFile.model.js';
import { IndianVisaSubmissionModel } from '../models/indianVisaSubmission.model.js';
import { PassportSubmissionModel } from '../models/passportSubmission.model.js';
import { CustomerGuardianModel } from '../models/customerGuardianApplication.model.js';
import { MoneyReceiptModel } from '../models/moneyReceipt.model.js';
import { InvoiceModel } from '../models/invoice.model.js';
import { CashVoucherModel } from '../models/cashVoucher.model.js';
import { SalarySlipModel } from '../models/salarySlip.model.js';
import { EmploymentAgreementModel } from '../models/employmentAgreement.model.js';

class StorageSyncService {
  constructor() {
    this.isReconciling = false;
    this.isDetecting = false;
  }

  /**
   * Recursively traverse local directory and collect file info
   * @param {string} dirPath - Absolute directory path
   * @param {string} [baseDir] - Base uploads directory path for relative key calculations
   * @returns {Promise<Array<{ absolutePath: string, relativePath: string, r2Key: string, sizeBytes: number, mtime: Date, fileName: string }>>}
   */
  async scanLocalDiskFiles(dirPath = path.join(process.cwd(), 'uploads'), baseDir = null) {
    const rootUploads = baseDir || dirPath;
    const results = [];

    if (!fs.existsSync(dirPath)) {
      return results;
    }

    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subResults = await this.scanLocalDiskFiles(fullPath, rootUploads);
        results.push(...subResults);
      } else if (entry.isFile()) {
        // Skip hidden files (.gitkeep, .DS_Store, etc.)
        if (entry.name.startsWith('.')) continue;

        try {
          const stats = await fs.promises.stat(fullPath);
          const relativeToUploads = path.relative(rootUploads, fullPath).replace(/\\/g, '/');
          const r2Key = `documents/${relativeToUploads}`.replace(/\/+/g, '/');

          results.push({
            absolutePath: fullPath,
            relativePath: `/uploads/${relativeToUploads}`.replace(/\/+/g, '/'),
            r2Key: relativeToUploads,
            fileName: entry.name,
            sizeBytes: stats.size,
            mtime: stats.mtime,
          });
        } catch (statErr) {
          console.warn(`Could not stat file: ${fullPath}`, statErr.message);
        }
      }
    }

    return results;
  }

  /**
   * Collect all active file URLs, paths, and filenames from all MongoDB models
   * @returns {Promise<{ activeKeys: Set<string>, activeFileNames: Set<string> }>}
   */
  async getAllActiveDbFileReferences() {
    const activeKeys = new Set();
    const activeFileNames = new Set();

    const addReference = (val) => {
      if (!val) return;
      if (typeof val === 'string') {
        const cleaned = val.trim();
        if (!cleaned) return;

        // Add raw string
        activeKeys.add(cleaned);

        // Normalize url / path
        const normalized = cleaned
          .replace(/^https?:\/\/[^/]+/, '')
          .replace(/^[/\\]+/, '')
          .replace(/^uploads[/\\]/i, '')
          .replace(/\\/g, '/');
        activeKeys.add(normalized);
        activeKeys.add(`/uploads/${normalized}`);

        // Add base filename
        const base = path.basename(cleaned);
        if (base && base !== '.' && base !== '/') {
          activeFileNames.add(base);
          activeKeys.add(base);
        }
      } else if (Array.isArray(val)) {
        val.forEach(addReference);
      } else if (typeof val === 'object') {
        Object.values(val).forEach(addReference);
      }
    };

    // 1. DocumentVault
    if (DocumentVaultModel) {
      const docs = await DocumentVaultModel.find({}, 'fileUrl fileName').lean();
      docs.forEach((d) => {
        addReference(d.fileUrl);
        addReference(d.fileName);
      });
    }

    // 2. Client
    if (Client) {
      const clients = await Client.find({}, 'photo passportScan documents').lean();
      clients.forEach((c) => {
        addReference(c.photo);
        addReference(c.passportScan);
        if (Array.isArray(c.documents)) {
          c.documents.forEach((doc) => {
            addReference(doc.fileUrl);
            addReference(doc.fileName);
            addReference(doc.url);
          });
        }
      });
    }

    // 3. CandidateCaseFile
    if (CandidateCaseFileModel) {
      const candidates = await CandidateCaseFileModel.find(
        {},
        'photo passportCopy medicalReport visaCopy files attachments documents'
      ).lean();
      candidates.forEach((c) => {
        addReference(c.photo);
        addReference(c.passportCopy);
        addReference(c.medicalReport);
        addReference(c.visaCopy);
        if (Array.isArray(c.files)) c.files.forEach(addReference);
        if (Array.isArray(c.attachments)) c.attachments.forEach(addReference);
        if (Array.isArray(c.documents)) c.documents.forEach(addReference);
      });
    }

    // 4. IndianVisaSubmission
    if (IndianVisaSubmissionModel) {
      const visas = await IndianVisaSubmissionModel.find(
        {},
        'passportPhoto oldVisaCopy electricityBill documents attachments'
      ).lean();
      visas.forEach((v) => {
        addReference(v.passportPhoto);
        addReference(v.oldVisaCopy);
        addReference(v.electricityBill);
        if (Array.isArray(v.documents)) v.documents.forEach(addReference);
        if (Array.isArray(v.attachments)) v.attachments.forEach(addReference);
      });
    }

    // 5. PassportSubmission
    if (PassportSubmissionModel) {
      const passports = await PassportSubmissionModel.find({}, 'passportScan documents').lean();
      passports.forEach((p) => {
        addReference(p.passportScan);
        if (Array.isArray(p.documents)) p.documents.forEach(addReference);
      });
    }

    // 6. CustomerGuardianApplication
    if (CustomerGuardianModel) {
      const apps = await CustomerGuardianModel.find(
        {},
        'photo signature nidCopy documents'
      ).lean();
      apps.forEach((a) => {
        addReference(a.photo);
        addReference(a.signature);
        addReference(a.nidCopy);
        if (Array.isArray(a.documents)) a.documents.forEach(addReference);
      });
    }

    // 7. MoneyReceipt & Invoices
    if (MoneyReceiptModel) {
      const receipts = await MoneyReceiptModel.find({}, 'receiptUrl attachmentUrl').lean();
      receipts.forEach((r) => {
        addReference(r.receiptUrl);
        addReference(r.attachmentUrl);
      });
    }
    if (InvoiceModel) {
      const invoices = await InvoiceModel.find({}, 'invoicePdfUrl attachmentUrl').lean();
      invoices.forEach((i) => {
        addReference(i.invoicePdfUrl);
        addReference(i.attachmentUrl);
      });
    }

    // 8. CashVoucher, SalarySlip, EmploymentAgreement
    if (CashVoucherModel) {
      const vouchers = await CashVoucherModel.find({}, 'attachmentUrl voucherFile').lean();
      vouchers.forEach((v) => {
        addReference(v.attachmentUrl);
        addReference(v.voucherFile);
      });
    }
    if (SalarySlipModel) {
      const slips = await SalarySlipModel.find({}, 'slipUrl attachmentUrl').lean();
      slips.forEach((s) => {
        addReference(s.slipUrl);
        addReference(s.attachmentUrl);
      });
    }
    if (EmploymentAgreementModel) {
      const agreements = await EmploymentAgreementModel.find({}, 'agreementDoc documents').lean();
      agreements.forEach((a) => {
        addReference(a.agreementDoc);
        if (Array.isArray(a.documents)) a.documents.forEach(addReference);
      });
    }

    return { activeKeys, activeFileNames };
  }

  /**
   * Phase 1: Reconcile Storage (Check local disk vs Cloudflare R2 and sync missing files)
   * @param {Object} [options]
   * @param {string} [options.triggeredBy='Cron_Scheduler'] - 'Cron_Scheduler' | 'Admin_Manual'
   * @param {string} [options.adminDid=null]
   * @returns {Promise<Object>}
   */
  async reconcileStorage({ triggeredBy = 'Cron_Scheduler', adminDid = null } = {}) {
    if (this.isReconciling) {
      return {
        status: 'SKIPPED',
        message: 'Storage reconciliation is already in progress.',
      };
    }

    this.isReconciling = true;
    const startTime = Date.now();
    const logDetails = [];
    let uploadedCount = 0;
    let missingCount = 0;
    let status = 'Success';

    try {
      const localFiles = await this.scanLocalDiskFiles();
      let r2Objects = [];
      const r2KeysSet = new Set();

      if (isR2Configured()) {
        try {
          r2Objects = await listAllR2Objects();
          r2Objects.forEach((obj) => r2KeysSet.add(obj.key));
        } catch (r2ListErr) {
          console.warn('Could not list R2 objects for full reconciliation:', r2ListErr.message);
        }
      }

      for (const localFile of localFiles) {
        const key = localFile.r2Key;
        const existsInR2 = r2KeysSet.has(key);

        if (!existsInR2 && isR2Configured()) {
          missingCount++;
          try {
            const buffer = await fs.promises.readFile(localFile.absolutePath);
            const ext = path.extname(localFile.fileName).toLowerCase();
            const contentType =
              ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
              ext === '.png' ? 'image/png' :
              ext === '.webp' ? 'image/webp' :
              ext === '.pdf' ? 'application/pdf' :
              ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              ext === '.xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
              'application/octet-stream';

            await uploadToR2({
              fileBuffer: buffer,
              key: key,
              contentType,
              metadata: { originalName: encodeURIComponent(localFile.fileName) },
            });

            uploadedCount++;
            logDetails.push({
              key,
              localPath: localFile.relativePath,
              action: 'UPLOADED_TO_R2',
              status: 'SUCCESS',
            });
          } catch (uploadErr) {
            status = 'Partial_Failure';
            logDetails.push({
              key,
              localPath: localFile.relativePath,
              action: 'FAILED',
              status: 'ERROR',
              error: uploadErr.message,
            });
          }
        }
      }

      const durationMs = Date.now() - startTime;

      // Save audit log
      const syncLog = await StorageSyncLogModel.create({
        did: generateDid(),
        triggeredBy,
        adminDid,
        localFilesScanned: localFiles.length,
        r2ObjectsCount: r2Objects.length,
        missingInR2Count: missingCount,
        filesUploadedToR2: uploadedCount,
        status,
        details: logDetails.slice(0, 100), // Cap logged details to 100 entries
        durationMs,
      });

      return {
        success: true,
        syncLogDid: syncLog.did,
        localFilesScanned: localFiles.length,
        r2ObjectsCount: r2Objects.length,
        missingInR2Count: missingCount,
        filesUploadedToR2: uploadedCount,
        status,
        durationMs,
      };
    } catch (err) {
      console.error('Storage reconciliation error:', err);
      return {
        success: false,
        status: 'Failed',
        error: err.message,
        durationMs: Date.now() - startTime,
      };
    } finally {
      this.isReconciling = false;
    }
  }

  /**
   * Phase 2: Detect Orphan / Unreferenced Files in Storage
   * @param {Object} [options]
   * @param {string} [options.initiatedBy='System_Scheduler']
   * @returns {Promise<Object>}
   */
  async detectOrphanFiles({ initiatedBy = 'System_Scheduler' } = {}) {
    if (this.isDetecting) {
      return {
        status: 'SKIPPED',
        message: 'Orphan file detection is already running.',
      };
    }

    this.isDetecting = true;
    try {
      const localFiles = await this.scanLocalDiskFiles();
      const { activeKeys, activeFileNames } = await this.getAllActiveDbFileReferences();

      const orphanFiles = [];
      let totalReclaimableBytes = 0;

      for (const file of localFiles) {
        const isReferenced =
          activeFileNames.has(file.fileName) ||
          activeKeys.has(file.r2Key) ||
          activeKeys.has(file.relativePath) ||
          activeKeys.has(file.fileName);

        if (!isReferenced) {
          orphanFiles.push({
            did: generateDid(),
            fileName: file.fileName,
            localPath: file.relativePath,
            r2Key: file.r2Key,
            sizeBytes: file.sizeBytes,
            reason: 'No active reference found across MongoDB document collections',
            detectedAt: new Date(),
          });
          totalReclaimableBytes += file.sizeBytes;
        }
      }

      if (orphanFiles.length === 0) {
        return {
          success: true,
          orphanCount: 0,
          totalFilesScanned: localFiles.length,
          totalReclaimableBytes: 0,
          message: 'No orphan files detected. Storage is clean!',
        };
      }

      // Generate unique batch number
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const batchNumber = `ORPHAN-BATCH-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

      const batch = await OrphanCleanupBatchModel.create({
        did: generateDid(),
        batchNumber,
        status: 'Pending_Review',
        totalFilesScanned: localFiles.length,
        orphanCount: orphanFiles.length,
        totalReclaimableBytes,
        orphanFiles,
        initiatedBy,
      });

      // Dispatch System Notification for Admin Review
      const reclaimableMB = (totalReclaimableBytes / (1024 * 1024)).toFixed(2);
      await NotificationModel.create({
        did: generateDid(),
        title: '⚠️ Unused / Orphan Files Detected',
        message: `${orphanFiles.length} unused files (~${reclaimableMB} MB) detected during storage scan. Pending admin review before cleanup.`,
        module: 'general',
        type: 'warning',
        refDid: batch.did,
        createdBy: 'StorageMaintenance_Engine',
      });

      // Emit WebSocket event if available
      if (global.io) {
        global.io.emit('new_orphan_cleanup_batch', {
          batchDid: batch.did,
          batchNumber: batch.batchNumber,
          orphanCount: batch.orphanCount,
          totalReclaimableBytes,
        });
      }

      return {
        success: true,
        batchDid: batch.did,
        batchNumber: batch.batchNumber,
        orphanCount: orphanFiles.length,
        totalFilesScanned: localFiles.length,
        totalReclaimableBytes,
        status: 'Pending_Review',
        message: `Batch ${batchNumber} created with ${orphanFiles.length} orphan files. Awaiting Admin confirmation.`,
      };
    } catch (err) {
      console.error('Orphan detection error:', err);
      return {
        success: false,
        error: err.message,
      };
    } finally {
      this.isDetecting = false;
    }
  }

  /**
   * Phase 3: Execute Admin-Approved Purge
   * @param {Object} params
   * @param {string} params.batchDid
   * @param {string} params.adminDid
   * @param {string} [params.adminName='Admin']
   * @returns {Promise<Object>}
   */
  async executePurgeBatch({ batchDid, adminDid, adminName = 'Admin' }) {
    const batch = await OrphanCleanupBatchModel.findOne({ did: batchDid });

    if (!batch) {
      throw new Error(`Orphan cleanup batch with DID ${batchDid} not found.`);
    }

    if (batch.status === 'Purged') {
      throw new Error(`Batch ${batch.batchNumber} has already been purged.`);
    }

    if (batch.status === 'Cancelled') {
      throw new Error(`Batch ${batch.batchNumber} is cancelled and cannot be purged.`);
    }

    let deletedFromDiskCount = 0;
    let deletedFromR2Count = 0;
    let failedCount = 0;
    const errors = [];
    const r2KeysToDelete = [];

    const uploadsRoot = path.join(process.cwd(), 'uploads');

    for (const item of batch.orphanFiles) {
      // 1. Delete from local disk
      if (item.localPath) {
        try {
          const cleanRel = item.localPath.replace(/^[/\\]+/, '').replace(/^uploads[/\\]/i, '');
          const absolutePath = path.join(uploadsRoot, cleanRel);

          if (absolutePath.startsWith(uploadsRoot) && fs.existsSync(absolutePath)) {
            await fs.promises.unlink(absolutePath);
            deletedFromDiskCount++;
          }
        } catch (diskErr) {
          failedCount++;
          errors.push(`Disk delete error for ${item.localPath}: ${diskErr.message}`);
        }
      }

      // 2. Collect R2 keys
      if (item.r2Key) {
        r2KeysToDelete.push(item.r2Key);
      }
    }

    // Delete from R2 in batch
    if (isR2Configured() && r2KeysToDelete.length > 0) {
      try {
        const r2DeleteResult = await deleteMultipleFromR2({ keys: r2KeysToDelete });
        deletedFromR2Count = r2DeleteResult.deletedCount;
        if (r2DeleteResult.errors.length > 0) {
          errors.push(...r2DeleteResult.errors.map((e) => JSON.stringify(e)));
        }
      } catch (r2BatchErr) {
        errors.push(`R2 batch delete error: ${r2BatchErr.message}`);
      }
    }

    // Update batch record
    batch.status = 'Purged';
    batch.reviewedByDid = adminDid;
    batch.reviewedByName = adminName;
    batch.purgedAt = new Date();
    batch.purgeResults = {
      deletedFromDiskCount,
      deletedFromR2Count,
      failedCount,
      errors: errors.slice(0, 50),
    };

    await batch.save();

    // Log in SystemLog
    await SystemLogModel.create({
      did: generateDid(),
      type: 'SYSTEM',
      targetCollection: 'orphan-cleanup-batches',
      action: 'SOFT_DELETE',
      createdBy: adminName,
      updatedBy: adminName,
      actionDetails: {
        did: adminDid,
        name: adminName,
        role: 'Admin',
      },
      payload: {
        batchDid: batch.did,
        batchNumber: batch.batchNumber,
        deletedFromDiskCount,
        deletedFromR2Count,
        reclaimedBytes: batch.totalReclaimableBytes,
      },
    });

    // Notify Admin of completed purge
    const freedMB = (batch.totalReclaimableBytes / (1024 * 1024)).toFixed(2);
    await NotificationModel.create({
      did: generateDid(),
      title: '✅ Storage Purge Completed',
      message: `Batch ${batch.batchNumber} purged successfully. Freed ~${freedMB} MB across local disk and R2.`,
      module: 'general',
      type: 'success',
      refDid: batch.did,
      createdBy: adminName,
    });

    return {
      success: true,
      batchNumber: batch.batchNumber,
      deletedFromDiskCount,
      deletedFromR2Count,
      failedCount,
      reclaimedBytes: batch.totalReclaimableBytes,
      purgedAt: batch.purgedAt,
    };
  }

  /**
   * Cancel an orphan batch without deleting files
   * @param {Object} params
   * @param {string} params.batchDid
   * @param {string} params.adminDid
   * @param {string} [params.adminName='Admin']
   */
  async cancelPurgeBatch({ batchDid, adminDid, adminName = 'Admin' }) {
    const batch = await OrphanCleanupBatchModel.findOne({ did: batchDid });

    if (!batch) {
      throw new Error(`Orphan cleanup batch with DID ${batchDid} not found.`);
    }

    if (batch.status === 'Purged') {
      throw new Error(`Cannot cancel a batch that has already been purged.`);
    }

    batch.status = 'Cancelled';
    batch.reviewedByDid = adminDid;
    batch.reviewedByName = adminName;
    await batch.save();

    return {
      success: true,
      batchNumber: batch.batchNumber,
      status: 'Cancelled',
      message: `Batch ${batch.batchNumber} has been cancelled. No files were deleted.`,
    };
  }
}

export const storageSyncService = new StorageSyncService();
export default storageSyncService;
