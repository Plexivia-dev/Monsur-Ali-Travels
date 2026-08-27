import storageSyncService from '../services/storageSync.service.js';
import { logger } from '../config/logger.js';

let intervalTimer = null;

// Starts the background storage maintenance scheduler (Runs every N hours, default: 48h / 2 days)
export const startStorageMaintenanceScheduler = () => {
  const enabled = process.env.STORAGE_MAINTENANCE_ENABLED !== 'false';
  if (!enabled) {
    logger.info('Storage maintenance background scheduler is disabled (STORAGE_MAINTENANCE_ENABLED=false).');
    return;
  }

  const intervalHours = Number(process.env.STORAGE_MAINTENANCE_INTERVAL_HOURS) || 48; // Default 48 hours (2 days)
  const intervalMs = intervalHours * 60 * 60 * 1000;

  logger.info(
    { intervalHours, nextRunInHours: intervalHours },
    `🕒 Storage maintenance scheduler initialized. Configured interval: ${intervalHours} hours (every ${intervalHours / 24} days).`
  );

  const runMaintenanceRoutine = async () => {
    logger.info('🚀 [StorageMaintenanceJob] Starting scheduled storage reconciliation & orphan file scan...');
    try {
      // 1. Reconcile storage (Disk vs R2)
      const syncResult = await storageSyncService.reconcileStorage({
        triggeredBy: 'Cron_Scheduler',
      });
      logger.info({ syncResult }, '✓ [StorageMaintenanceJob] Storage reconciliation completed.');

      // 2. Detect orphan files (DB vs Storage)
      const orphanResult = await storageSyncService.detectOrphanFiles({
        initiatedBy: 'System_Scheduler',
      });
      logger.info({ orphanResult }, '✓ [StorageMaintenanceJob] Orphan file scan completed.');
    } catch (err) {
      logger.error({ err }, '❌ [StorageMaintenanceJob] Error during scheduled storage maintenance.');
    }
  };

  // Run on startup if explicitly requested (default: false to prevent blocking boot)
  if (process.env.STORAGE_MAINTENANCE_RUN_ON_STARTUP === 'true') {
    setTimeout(runMaintenanceRoutine, 15000); // 15 seconds after server start
  }

  // Set recurring interval
  intervalTimer = setInterval(runMaintenanceRoutine, intervalMs);
};

// Stops scheduler gracefully on shutdown
export const stopStorageMaintenanceScheduler = () => {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
    logger.info('Storage maintenance scheduler stopped.');
  }
};

export default {
  startStorageMaintenanceScheduler,
  stopStorageMaintenanceScheduler,
};
