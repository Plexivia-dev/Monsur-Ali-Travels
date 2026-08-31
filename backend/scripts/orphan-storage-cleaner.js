/**
 * On-Demand Orphan Storage Cleaner & R2 Sync CLI Utility
 * Usage: node scripts/orphan-storage-cleaner.js [--dry-run]
 */

import { connectDatabase } from '../src/database/index.js';
import storageSyncService from '../src/services/storageSync.service.js';
import { logger } from '../src/config/logger.js';

async function runCleaner() {
  const isDryRun = process.argv.includes('--dry-run');

  logger.info(`Starting Orphan Storage Cleanup utility (dryRun: ${isDryRun})...`);

  try {
    await connectDatabase();

    // 1. Reconcile Storage between Local and R2
    logger.info('Phase 1: Reconciling Local Disk vs Cloudflare R2 Storage...');
    const syncResult = await storageSyncService.reconcileStorage({
      triggeredBy: 'Manual_CLI_Cleaner',
    });
    logger.info(syncResult, '✓ Storage reconciliation finished.');

    // 2. Scan and report orphan files
    logger.info('Phase 2: Scanning for unreferenced orphan files...');
    const orphanResult = await storageSyncService.detectOrphanFiles({
      initiatedBy: 'Manual_CLI_Cleaner',
    });
    logger.info(orphanResult, '✓ Orphan file detection finished.');

    logger.info('🎉 Storage maintenance and orphan cleanup process completed successfully.');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, '❌ Error running orphan storage cleaner.');
    process.exit(1);
  }
}

runCleaner();
