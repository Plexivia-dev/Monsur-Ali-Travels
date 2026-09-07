import fs from 'fs';
import path from 'path';
import express from 'express';

async function auditDeep() {
  const rootDir = path.resolve('src');
  console.log('--- STARTING DEEP COMPONENT AUDIT ---');

  // 1. Controller Audit
  console.log('\n================== CONTROLLERS AUDIT ==================');
  const ctrlDir = path.resolve('src/controllers');
  const ctrlFiles = [];
  function scanDir(dir, list) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (fs.statSync(full).isDirectory()) scanDir(full, list);
      else if (f.endsWith('.js')) list.push(full);
    }
  }
  scanDir(ctrlDir, ctrlFiles);

  const missingReturns = [];
  const missingTryCatch = [];
  const responseIssues = [];

  for (const file of ctrlFiles) {
    const rel = path.relative(ctrlDir, file);
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    // Check for `res.status(...).json(...)` without return where execution continues
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line sends a response inside an if block without return or block
      // Example: if (!doc) res.status(404).json(...); without return
      if (trimmed.startsWith('if (') || trimmed.startsWith('if(')) {
        if (trimmed.includes('res.status(') && !trimmed.includes('return res.status(') && !trimmed.includes('return;')) {
          // Check if it's a one-liner without return
          if (!trimmed.includes('{')) {
            missingReturns.push({
              file: rel,
              line: i + 1,
              code: trimmed,
              reason: 'One-line if statement sending response without return (execution will continue!)'
            });
          }
        }
      }

      // Check for res.status(4xx/5xx) inside a block without return
      if (
        (trimmed.startsWith('res.status(4') || trimmed.startsWith('res.status(5') || trimmed.startsWith('res.status(404') || trimmed.startsWith('res.status(400)')) &&
        !trimmed.startsWith('return ')
      ) {
        // Check if next line is 'return;' or if next line closes block
        const nextLine = (lines[i + 1] || '').trim();
        if (nextLine !== 'return;' && nextLine !== 'return' && !nextLine.startsWith('return ') && !trimmed.endsWith('return;') && nextLine !== '}') {
          responseIssues.push({
            file: rel,
            line: i + 1,
            code: trimmed,
            nextLine,
            reason: 'Error response sent without explicit return'
          });
        }
      }
    }

    // Inspect exported handlers
    try {
      const mod = await import('file://' + file.replace(/\\/g, '/'));
      for (const [name, val] of Object.entries(mod)) {
        if (typeof val === 'function') {
          const fnStr = val.toString();
          // Check if function has try/catch or calls next
          if (fnStr.includes('req') && fnStr.includes('res')) {
            const hasTryCatch = fnStr.includes('try {') || fnStr.includes('try{');
            const hasNext = fnStr.includes('next(') || fnStr.includes('next (');
            if (!hasTryCatch && !hasNext && (fnStr.includes('await ') || fnStr.includes('Promise'))) {
              missingTryCatch.push({
                file: rel,
                function: name,
                reason: 'Async handler has no try-catch and no next(err) call'
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading controller:', rel, e.message);
    }
  }

  console.log(`Found ${missingReturns.length} critical missing-return bugs:`);
  console.log(JSON.stringify(missingReturns, null, 2));

  console.log(`\nFound ${responseIssues.length} potential response execution continuation warnings:`);
  console.log(JSON.stringify(responseIssues, null, 2));

  console.log(`\nFound ${missingTryCatch.length} async handlers without try/catch or next:`);
  console.log(JSON.stringify(missingTryCatch, null, 2));

  // 2. Routes vs Controller parameter alignment audit
  console.log('\n================== ROUTES & PARAMETERS AUDIT ==================');
  const routesDir = path.resolve('src/routes');
  const routeFiles = [];
  scanDir(routesDir, routeFiles);

  const routeIssues = [];
  for (const file of routeFiles) {
    const rel = path.relative(routesDir, file);
    const content = fs.readFileSync(file, 'utf8');

    // Find all route definitions e.g. router.get('/:id', ...), router.route('/:did')
    const routeRegex = /\.(?:get|post|put|patch|delete|route)\s*\(\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const routePath = match[1];
      // extract params like :id, :did, :caseDid
      const params = (routePath.match(/:[a-zA-Z0-9_]+/g) || []).map(p => p.slice(1));
      
      // Let's check which controllers are imported in this route file
      // Check if route defines :id but controller expects :did or vice versa
      routeIssues.push({
        file: rel,
        path: routePath,
        params,
      });
    }
  }
  console.log(`Scanned ${routeIssues.length} routes.`);

  // 3. Audit all models for schema & virtual consistency
  console.log('\n================== MODELS AUDIT ==================');
  const modelsDir = path.resolve('src/models');
  const modelFiles = [];
  scanDir(modelsDir, modelFiles);

  const modelIssues = [];
  for (const file of modelFiles) {
    const rel = path.relative(modelsDir, file);
    const content = fs.readFileSync(file, 'utf8');

    // Check if pre-save has `async function (next)`
    if (/pre\s*\(\s*['"]save['"]\s*,\s*async\s+function\s*\(\s*next\s*\)/.test(content) ||
        /pre\s*\(\s*['"]save['"]\s*,\s*async\s*\(\s*next\s*\)\s*=>/.test(content)) {
      modelIssues.push({
        file: rel,
        issue: 'Async pre-save hook declares `next` parameter (anti-pattern in Mongoose 8, causing double callbacks/race conditions)',
      });
    }

    // Check if export default is missing
    if (!content.includes('export default')) {
      modelIssues.push({
        file: rel,
        issue: 'Missing `export default` in model file',
      });
    }

    // Check if toJSON is defined
    if (!content.includes('toJSON')) {
      modelIssues.push({
        file: rel,
        issue: 'Model schema does not define toJSON transform for did/_id consistency',
      });
    }
  }
  console.log('Model issues found:', modelIssues.length);
  console.log(JSON.stringify(modelIssues, null, 2));
}

auditDeep().catch(console.error);
