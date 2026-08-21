const fs = require('fs');
const path = require('path');

function replaceInDir(dir, replacements) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        replaceInDir(fullPath, replacements);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [search, replace] of Object.entries(replacements)) {
        if (content.includes(search)) {
          content = content.split(search).join(replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated API paths in ${fullPath}`);
      }
    }
  }
}

// Client replacements
const clientReplacements = {
  '/api/v1/cases': '/api/v1/client/cases',
  '/api/v1/customers': '/api/v1/client/customers',
  '/api/v1/candidates': '/api/v1/client/candidates',
  '/api/v1/agreements': '/api/v1/client/agreements',
  '/api/v1/indian-visas': '/api/v1/client/indian-visas',
  '/api/v1/passports': '/api/v1/client/passports',
  '/api/v1/payrolls': '/api/v1/client/payrolls',
  '/api/v1/invoices': '/api/v1/client/invoices',
  '/api/v1/receipts': '/api/v1/client/receipts',
  '/api/v1/money-receipts': '/api/v1/client/money-receipts',
  '/api/v1/docs': '/api/v1/client/docs',
  '/api/v1/sendEmail': '/api/v1/client/sendEmail'
};

// Admin replacements
const adminReplacements = {
  '/api/v1/dashboard': '/api/v1/admin/dashboard',
  '/api/v1/system': '/api/v1/admin/system',
  '/api/v1/users': '/api/v1/admin/users'
};

const adminDashDir = path.join(__dirname, 'dashboard', 'admin');
const clientDashDir = path.join(__dirname, 'dashboard', 'client');

console.log("Replacing in dashboard/admin...");
replaceInDir(adminDashDir, adminReplacements);

console.log("Replacing in dashboard/client...");
replaceInDir(clientDashDir, clientReplacements);

console.log("Done.");
