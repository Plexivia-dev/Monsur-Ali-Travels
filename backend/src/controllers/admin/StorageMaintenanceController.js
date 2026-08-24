import storageSyncService from '../../services/storageSync.service.js';
import { OrphanCleanupBatchModel } from '../../models/orphanCleanupBatch.model.js';
import { StorageSyncLogModel } from '../../models/storageSyncLog.model.js';
import { isR2Configured } from '../../utils/r2.util.js';

class StorageMaintenanceController {
  /**
   * Get Storage Status & Health Overview
   * GET /api/v1/admin/storage/overview
   */
  async getStorageOverview(req, res) {
    try {
      const localFiles = await storageSyncService.scanLocalDiskFiles();
      const totalLocalBytes = localFiles.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);

      // 1. Category breakdown
      const categories = {
        passports: { name: 'Passports', count: 0, bytes: 0 },
        visas: { name: 'Visas', count: 0, bytes: 0 },
        invoices: { name: 'Invoices', count: 0, bytes: 0 },
        receipts: { name: 'Receipts', count: 0, bytes: 0 },
        general: { name: 'General Documents', count: 0, bytes: 0 },
      };

      for (const file of localFiles) {
        const lower = file.relativePath.toLowerCase();
        const size = file.sizeBytes || 0;
        if (lower.includes('passport')) {
          categories.passports.count++;
          categories.passports.bytes += size;
        } else if (lower.includes('visa')) {
          categories.visas.count++;
          categories.visas.bytes += size;
        } else if (lower.includes('invoice')) {
          categories.invoices.count++;
          categories.invoices.bytes += size;
        } else if (lower.includes('receipt') || lower.includes('voucher') || lower.includes('slip')) {
          categories.receipts.count++;
          categories.receipts.bytes += size;
        } else {
          categories.general.count++;
          categories.general.bytes += size;
        }
      }

      // 2. Cumulative sync metrics from logs
      const syncLogsStats = await StorageSyncLogModel.aggregate([
        {
          $group: {
            _id: null,
            totalSyncRuns: { $sum: 1 },
            totalFilesUploaded: { $sum: '$filesUploadedToR2' },
            successfulRuns: {
              $sum: { $cond: [{ $eq: ['$status', 'Success'] }, 1, 0] },
            },
          },
        },
      ]);

      const cumulative = syncLogsStats[0] || {
        totalSyncRuns: 0,
        totalFilesUploaded: 0,
        successfulRuns: 0,
      };

      const pendingBatchesCount = await OrphanCleanupBatchModel.countDocuments({
        status: 'Pending_Review',
      });
      const lastBatch = await OrphanCleanupBatchModel.findOne()
        .sort({ createdAt: -1 })
        .lean();

      const lastSyncLog = await StorageSyncLogModel.findOne()
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        status: 'success',
        data: {
          r2Configured: isR2Configured(),
          localFilesCount: localFiles.length,
          totalLocalBytes,
          totalLocalMB: (totalLocalBytes / (1024 * 1024)).toFixed(2),
          totalLocalGB: (totalLocalBytes / (1024 * 1024 * 1024)).toFixed(3),
          categories,
          cumulativeStats: cumulative,
          pendingBatchesCount,
          lastBatch,
          lastSyncLog,
        },
      });
    } catch (error) {
      console.error('Storage overview error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to fetch storage overview.',
      });
    }
  }

  /**
   * Manually trigger Storage Reconciliation (Disk vs R2)
   * POST /api/v1/admin/storage/sync
   */
  async triggerReconciliation(req, res) {
    try {
      const adminDid = req.user?.did || null;
      const result = await storageSyncService.reconcileStorage({
        triggeredBy: 'Admin_Manual',
        adminDid,
      });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: 'Storage reconciliation completed successfully.',
        data: result,
      });
    } catch (error) {
      console.error('Manual reconciliation error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to execute storage reconciliation.',
      });
    }
  }

  /**
   * Manually trigger Orphan File Detection (DB vs Storage)
   * POST /api/v1/admin/storage/detect-orphans
   */
  async triggerOrphanDetection(req, res) {
    try {
      const initiatedBy = req.user?.did || 'Admin_Manual';
      const result = await storageSyncService.detectOrphanFiles({ initiatedBy });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: result.message || 'Orphan file detection completed.',
        data: result,
      });
    } catch (error) {
      console.error('Orphan detection trigger error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to detect orphan files.',
      });
    }
  }

  /**
   * List all Orphan Cleanup Batches
   * GET /api/v1/admin/storage/cleanup-batches
   */
  async getCleanupBatches(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const query = {};
      if (status) query.status = status;

      const skip = (Number(page) - 1) * Number(limit);
      const total = await OrphanCleanupBatchModel.countDocuments(query);
      const batches = await OrphanCleanupBatchModel.find(query)
        .select('-orphanFiles') // Exclude heavy array in list view
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      return res.status(200).json({
        success: true,
        status: 'success',
        data: batches,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      });
    } catch (error) {
      console.error('Get cleanup batches error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to fetch cleanup batches.',
      });
    }
  }

  /**
   * Get Details of a Specific Cleanup Batch (including file list)
   * GET /api/v1/admin/storage/cleanup-batches/:batchDid
   */
  async getCleanupBatchDetails(req, res) {
    try {
      const { batchDid } = req.params;
      const batch = await OrphanCleanupBatchModel.findOne({ did: batchDid }).lean();

      if (!batch) {
        return res.status(404).json({
          success: false,
          status: 'error',
          message: 'Cleanup batch not found.',
        });
      }

      return res.status(200).json({
        success: true,
        status: 'success',
        data: batch,
      });
    } catch (error) {
      console.error('Get cleanup batch details error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to fetch batch details.',
      });
    }
  }

  /**
   * Admin Approve and Execute Purge of an Orphan Batch
   * POST /api/v1/admin/storage/cleanup-batches/:batchDid/approve
   */
  async approvePurgeBatch(req, res) {
    try {
      const { batchDid } = req.params;
      const adminDid = req.user?.did || 'SYSTEM_ADMIN';
      const adminName = req.user?.name || req.user?.email || 'Admin';

      const result = await storageSyncService.executePurgeBatch({
        batchDid,
        adminDid,
        adminName,
      });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: `Batch ${result.batchNumber} purged successfully.`,
        data: result,
      });
    } catch (error) {
      console.error('Approve purge error:', error);
      return res.status(400).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to execute purge.',
      });
    }
  }

  /**
   * Admin Cancel an Orphan Batch
   * POST /api/v1/admin/storage/cleanup-batches/:batchDid/cancel
   */
  async cancelCleanupBatch(req, res) {
    try {
      const { batchDid } = req.params;
      const adminDid = req.user?.did || 'SYSTEM_ADMIN';
      const adminName = req.user?.name || req.user?.email || 'Admin';

      const result = await storageSyncService.cancelPurgeBatch({
        batchDid,
        adminDid,
        adminName,
      });

      return res.status(200).json({
        success: true,
        status: 'success',
        message: result.message,
        data: result,
      });
    } catch (error) {
      console.error('Cancel cleanup batch error:', error);
      return res.status(400).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to cancel batch.',
      });
    }
  }

  /**
   * Get Storage Sync Logs History
   * GET /api/v1/admin/storage/sync-logs
   */
  async getSyncLogs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const total = await StorageSyncLogModel.countDocuments();
      const logs = await StorageSyncLogModel.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

      return res.status(200).json({
        success: true,
        status: 'success',
        data: logs,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      });
    } catch (error) {
      console.error('Get sync logs error:', error);
      return res.status(500).json({
        success: false,
        status: 'error',
        message: error.message || 'Failed to fetch storage sync logs.',
      });
    }
  }
}

export const storageMaintenanceController = new StorageMaintenanceController();
export default storageMaintenanceController;
