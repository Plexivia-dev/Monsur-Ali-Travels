import { Router } from 'express';
import storageMaintenanceController from '../../controllers/admin/StorageMaintenanceController.js';
import { authenticateToken, authorizeRoles } from '../../middlewares/auth.middleware.js';

const storageMaintenanceRouter = Router();

// Protect all maintenance routes for Owner, Admin, Manager, Superadmin
storageMaintenanceRouter.use(
  authenticateToken,
  authorizeRoles('Owner', 'Admin', 'Manager', 'Super Admin', 'Superadmin')
);

// 1. Get Storage Overview & Health
// GET /api/v1/admin/storage/overview
storageMaintenanceRouter.get('/overview', (req, res) => {
  storageMaintenanceController.getStorageOverview(req, res);
});

// 2. Trigger Manual Storage Reconciliation (Disk vs R2)
// POST /api/v1/admin/storage/sync
storageMaintenanceRouter.post('/sync', (req, res) => {
  storageMaintenanceController.triggerReconciliation(req, res);
});

// 3. Trigger Manual Orphan File Detection
// POST /api/v1/admin/storage/detect-orphans
storageMaintenanceRouter.post('/detect-orphans', (req, res) => {
  storageMaintenanceController.triggerOrphanDetection(req, res);
});

// 4. List Orphan Cleanup Batches
// GET /api/v1/admin/storage/cleanup-batches
storageMaintenanceRouter.get('/cleanup-batches', (req, res) => {
  storageMaintenanceController.getCleanupBatches(req, res);
});

// 5. Get Specific Cleanup Batch Details
// GET /api/v1/admin/storage/cleanup-batches/:batchDid
storageMaintenanceRouter.get('/cleanup-batches/:batchDid', (req, res) => {
  storageMaintenanceController.getCleanupBatchDetails(req, res);
});

// 6. Admin Approve and Purge Batch
// POST /api/v1/admin/storage/cleanup-batches/:batchDid/approve
storageMaintenanceRouter.post('/cleanup-batches/:batchDid/approve', (req, res) => {
  storageMaintenanceController.approvePurgeBatch(req, res);
});

// 7. Admin Cancel Batch
// POST /api/v1/admin/storage/cleanup-batches/:batchDid/cancel
storageMaintenanceRouter.post('/cleanup-batches/:batchDid/cancel', (req, res) => {
  storageMaintenanceController.cancelCleanupBatch(req, res);
});

// 8. Get Storage Sync Logs
// GET /api/v1/admin/storage/sync-logs
storageMaintenanceRouter.get('/sync-logs', (req, res) => {
  storageMaintenanceController.getSyncLogs(req, res);
});

export default storageMaintenanceRouter;
