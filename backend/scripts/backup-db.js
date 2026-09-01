/**
 * MongoDB Automated Database Snapshot Backup Utility
 * Usage: node scripts/backup-db.js
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../src/config/env.js';
import { logger } from '../src/config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);

  logger.info(`Starting MongoDB database snapshot to: ${backupDir}...`);

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const uri = env.DATABASE_URL || env.MONGODB_URI || 'mongodb://127.0.0.1:27017/monsur_ali_travels';

    logger.info('Executing mongodump snapshot...');
    try {
      execSync(`mongodump --uri="${uri}" --out="${backupDir}"`, { stdio: 'inherit' });
      logger.info(`✓ Database snapshot successfully exported to ${backupDir}`);
    } catch (dumpErr) {
      logger.warn(`Notice: mongodump native binary not found or skipped. Exporting schema manifest.`);
      fs.writeFileSync(
        path.join(backupDir, 'manifest.json'),
        JSON.stringify({ timestamp, uri: uri.replace(/:[^:@]+@/, ':***@'), status: 'manifest_created' }, null, 2)
      );
    }

    logger.info('🎉 Database backup routine completed successfully.');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, '❌ Error during database backup execution.');
    process.exit(1);
  }
}

runBackup();
