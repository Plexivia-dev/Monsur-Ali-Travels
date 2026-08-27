import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setupR2() {
  console.log('\n🚀 ==========================================');
  console.log('   Cloudflare R2 Storage Automated Setup   ');
  console.log('==========================================\n');

  try {
    const accountId = (await askQuestion('👉 Enter Cloudflare Account ID: ')).trim();
    const accessKeyId = (await askQuestion('👉 Enter R2 Access Key ID: ')).trim();
    const secretAccessKey = (await askQuestion('👉 Enter R2 Secret Access Key: ')).trim();
    let bucketName = (await askQuestion('👉 Enter Bucket Name (default: mat-erp-documents): ')).trim();
    if (!bucketName) bucketName = 'mat-erp-documents';

    console.log('\n⏳ Updating .env configuration...');

    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const r2Config = `
# ==========================================
# Cloudflare R2 Storage Configuration (No Auto-Delete)
# ==========================================
R2_ACCOUNT_ID=${accountId}
R2_ACCESS_KEY_ID=${accessKeyId}
R2_SECRET_ACCESS_KEY=${secretAccessKey}
R2_BUCKET_NAME=${bucketName}
R2_ENDPOINT=https://${accountId}.r2.cloudflarestorage.com
`;

    // Clean previous R2 configs if exist
    envContent = envContent.replace(/# ==========================================\n# Cloudflare R2 Storage Configuration[\s\S]*?(?=(#|$))/g, '');
    envContent = envContent.trim() + '\n' + r2Config;

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    console.log('✅ .env file successfully updated with R2 credentials!');

    console.log('\n📌 [Next Step]: Install the S3 client package if not installed:');
    console.log('   npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner\n');

    console.log('🎉 Setup Completed! R2 is ready to use.\n');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

setupR2();
