import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('dashboard/src');

const replacements = [
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Card['"]/g, to: 'from "$1/card"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Table['"]/g, to: 'from "$1/table"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Badge['"]/g, to: 'from "$1/badge"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Button['"]/g, to: 'from "$1/button"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Input['"]/g, to: 'from "$1/input"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Tabs['"]/g, to: 'from "$1/tabs"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Select['"]/g, to: 'from "$1/select"' },
  { from: /from ['"](\.\.\/ui|@\/components\/ui)\/Dialog['"]/g, to: 'from "$1/dialog"' },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated casing in: ${fullPath}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Finished fixing casing imports.');
