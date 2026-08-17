import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('dashboard/src');

function scanImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanImports(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/from ['"][^'"]*\/ui\/[^'"]*['"]/g);
      if (matches) {
        matches.forEach((m) => console.log(`${file}: ${m}`));
      }
    }
  }
}

scanImports(srcDir);
