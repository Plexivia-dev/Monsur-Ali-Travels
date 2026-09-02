import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const backendRoot = process.cwd();
const srcDir = path.join(backendRoot, "src");

const results = {
  totalFiles: 0,
  importedSuccessfully: 0,
  importFailures: [],
  routeChecks: [],
  warnings: [],
};

// Recursively find all .js files in a directory
function getJsFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name !== "node_modules" && item.name !== "uploads" && item.name !== "documents") {
        files = files.concat(getJsFiles(fullPath));
      }
    } else if (item.name.endsWith(".js") && item.name !== "server.js") {
      files.push(fullPath);
    }
  }
  return files;
}

async function runAudit() {
  console.log("=== STARTING DEEP AUDIT OF MONSUR ALI TRAVELS BACKEND ===");
  const allFiles = getJsFiles(srcDir);
  results.totalFiles = allFiles.length;
  console.log(`Found ${allFiles.length} JavaScript files in src/`);

  // 1. Dynamic Import Check
  console.log("\n--- Phase 1: Dynamic Import Verification ---");
  for (const filePath of allFiles) {
    if (filePath.endsWith("server.js")) {
      results.importedSuccessfully++;
      continue;
    }
    const fileUrl = pathToFileURL(filePath).href;
    const relPath = path.relative(backendRoot, filePath);
    try {
      await import(fileUrl);
      results.importedSuccessfully++;
    } catch (err) {
      console.error(`❌ IMPORT ERROR in ${relPath}:`, err.message);
      results.importFailures.push({ file: relPath, error: err.message, stack: err.stack });
    }
  }
  console.log(`Phase 1 Complete: ${results.importedSuccessfully}/${results.totalFiles} files loaded without crashing.`);

  // 2. Route Stack & Handler Inspection
  console.log("\n--- Phase 2: Express Router Stack Verification ---");
  try {
    const coreRouterMod = await import(pathToFileURL(path.join(srcDir, "routesIndex.js")).href);
    const coreRouter = coreRouterMod.default;

    function inspectRouter(router, prefix = "") {
      if (!router || !router.stack) return;
      for (const layer of router.stack) {
        if (layer.route) {
          const pathStr = prefix + layer.route.path;
          const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(", ");
          for (const handler of layer.route.stack) {
            if (typeof handler.handle !== "function") {
              const err = `❌ Route [${methods}] ${pathStr} has invalid handler: ${typeof handler.handle}`;
              console.error(err);
              results.warnings.push(err);
            }
          }
          results.routeChecks.push({ path: pathStr, methods, handlersCount: layer.route.stack.length });
        } else if (layer.name === "router" && layer.handle && layer.handle.stack) {
          let mountPath = "";
          if (layer.regexp) {
            // best effort path extraction from regex
            mountPath = layer.regexp.source
              .replace("^\\", "")
              .replace("\\/?(?=\\/|$)", "")
              .replace(/\\\//g, "/")
              .replace(/\^/g, "")
              .replace(/\$/g, "")
              .replace(/\?\(\?=\/\|\$\)/g, "")
              .replace(/\/\?\(\?=\/\|\$\)/g, "")
              .replace(/\(\?:\(\[\^\/\]\+\?\)\)/g, ":param");
          }
          inspectRouter(layer.handle, prefix + (mountPath.startsWith("/") ? "" : "/") + mountPath);
        }
      }
    }

    inspectRouter(coreRouter, "/api/v1");
    console.log(`Phase 2 Complete: Inspected ${results.routeChecks.length} registered endpoints.`);
  } catch (err) {
    console.error("❌ Error during Express Router Stack Inspection:", err.message);
    results.warnings.push({ phase: "routesIndex", error: err.message });
  }

  // 3. Inspect createApp
  console.log("\n--- Phase 3: createApp Initialization Verification ---");
  try {
    const appMod = await import(pathToFileURL(path.join(srcDir, "app.js")).href);
    const createApp = appMod.createApp;
    if (typeof createApp === "function") {
      const app = await createApp();
      if (app && app._router) {
        console.log("✅ createApp() initialized successfully!");
      }
    }
  } catch (err) {
    console.error("❌ Error initializing createApp():", err.message);
    results.warnings.push({ phase: "createApp", error: err.message, stack: err.stack });
  }

  console.log("\n=== AUDIT SUMMARY ===");
  console.log(`Total Files Checked: ${results.totalFiles}`);
  console.log(`Import Errors: ${results.importFailures.length}`);
  console.log(`Route Endpoints: ${results.routeChecks.length}`);
  console.log(`Warnings/Issues: ${results.warnings.length}`);

  if (results.importFailures.length > 0) {
    console.log("\nList of Import Failures:");
    for (const f of results.importFailures) {
      console.log(`- ${f.file}: ${f.error}`);
    }
  }
}

runAudit().catch(console.error);
