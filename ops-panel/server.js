const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { spawn, exec } = require("child_process");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8090;
const APP_ROOT = process.env.APP_ROOT || "/opt/monsuralitravels";
const ENV_FILE = path.join(__dirname, ".env");

// Ensure environment secrets exist
if (!process.env.SESSION_SECRET) {
  const generatedSecret = crypto.randomBytes(32).toString("hex");
  process.env.SESSION_SECRET = generatedSecret;
  fs.appendFileSync(ENV_FILE, `\nSESSION_SECRET=${generatedSecret}\n`);
}

const DEFAULT_USER = process.env.PANEL_USER || "developer";
// Helper for password hashing (PBKDF2)
function hashPassword(password, salt = "mat-salt-ops-2026") {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
}

let CURRENT_HASH = process.env.PANEL_PASSWORD_HASH;
if (!CURRENT_HASH) {
  const initialPassword = process.env.PANEL_PASSWORD || "matOpsSecure2026!";
  CURRENT_HASH = hashPassword(initialPassword);
  process.env.PANEL_PASSWORD_HASH = CURRENT_HASH;
  fs.appendFileSync(ENV_FILE, `\nPANEL_PASSWORD_HASH=${CURRENT_HASH}\nPANEL_USER=${DEFAULT_USER}\n`);
  console.log(`[AUTH] Initial developer password set to: ${initialPassword}`);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));
app.use(cors());

// Normalize /cpanel prefix if passed from reverse proxy
app.use((req, res, next) => {
  if (req.url.startsWith("/cpanel")) {
    req.url = req.url.slice(7) || "/";
  }
  next();
});

// Token helpers
function createToken(username) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({
    user: username,
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", process.env.SESSION_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", process.env.SESSION_SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
function requireAuth(req, res, next) {
  let token = req.cookies.ops_token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    if (req.accepts("html")) {
      const isCpanel = req.originalUrl && req.originalUrl.startsWith("/cpanel");
      return res.redirect(isCpanel ? "/cpanel/login" : "/login");
    }
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = decoded;
  next();
}

// Rate Limiter for Login
const loginAttempts = new Map();
function rateLimitLogin(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now };
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(ip);
  } else if (record.count >= 10) {
    return res.status(429).json({ error: "Too many login attempts. Please wait 15 minutes." });
  }
  next();
}

// State for running processes
let activeJob = null;
const logHistory = [];
const MAX_LOG_LINES = 1500;
const sseClients = new Set();

function broadcastSSE(data) {
  const msg = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(msg);
  }
}

function appendLog(type, text) {
  const entry = { type, text, timestamp: new Date().toISOString() };
  logHistory.push(entry);
  if (logHistory.length > MAX_LOG_LINES) {
    logHistory.shift();
  }
  broadcastSSE({ event: "log", entry });
}

// Calculate CPU Usage using /proc/stat
let prevCpu = null;
function getCpuUsage() {
  return new Promise((resolve) => {
    fs.readFile("/proc/stat", "utf8", (err, data) => {
      if (err || !data) {
        const load = os.loadavg()[0];
        const cores = os.cpus().length || 1;
        return resolve(Math.min(100, Math.round((load / cores) * 100)));
      }
      const lines = data.split("\n");
      const cpuLine = lines[0];
      const parts = cpuLine.trim().split(/\s+/).slice(1).map(Number);
      const idle = parts[3] + (parts[4] || 0);
      const total = parts.reduce((a, b) => a + b, 0);

      if (!prevCpu) {
        prevCpu = { idle, total };
        return resolve(2);
      }
      const idleDiff = idle - prevCpu.idle;
      const totalDiff = total - prevCpu.total;
      prevCpu = { idle, total };
      const usage = totalDiff > 0 ? Math.round(100 * (1 - idleDiff / totalDiff)) : 0;
      resolve(Math.max(0, Math.min(100, usage)));
    });
  });
}

// Cache storage measurements
let storageCache = { data: null, timestamp: 0 };

// -------------------------------------------------------------
// Public Routes
// -------------------------------------------------------------
app.get("/login", (req, res) => {
  const token = req.cookies.ops_token;
  if (verifyToken(token)) {
    const target = req.originalUrl && req.originalUrl.startsWith("/cpanel") ? "/cpanel/" : "/";
    return res.redirect(target);
  }
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/api/login", rateLimitLogin, (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.connection.remoteAddress;

  const validUser = process.env.PANEL_USER || "developer";
  const passHash = hashPassword(password || "");

  if (username === validUser && passHash === CURRENT_HASH) {
    loginAttempts.delete(ip);
    const token = createToken(username);
    res.cookie("ops_token", token, {
      httpOnly: true,
      secure: false, // will work over http reverse-proxied to https
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/"
    });
    return res.json({ success: true, token, username });
  }

  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: Date.now() };
  record.count += 1;
  loginAttempts.set(ip, record);
  res.status(401).json({ error: "Invalid username or password" });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("ops_token", { path: "/" });
  res.json({ success: true });
});

// -------------------------------------------------------------
// Protected Routes
// -------------------------------------------------------------
app.get("/", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(express.static(path.join(__dirname, "public")));

// Session Check
app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user.user, uptime: process.uptime() });
});

// Change Password
app.post("/api/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters." });
  }
  if (hashPassword(currentPassword || "") !== CURRENT_HASH) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  CURRENT_HASH = hashPassword(newPassword);
  process.env.PANEL_PASSWORD_HASH = CURRENT_HASH;

  // Persist to .env
  try {
    let envContent = fs.readFileSync(ENV_FILE, "utf8");
    if (envContent.includes("PANEL_PASSWORD_HASH=")) {
      envContent = envContent.replace(/PANEL_PASSWORD_HASH=.*/g, `PANEL_PASSWORD_HASH=${CURRENT_HASH}`);
    } else {
      envContent += `\nPANEL_PASSWORD_HASH=${CURRENT_HASH}\n`;
    }
    fs.writeFileSync(ENV_FILE, envContent, "utf8");
  } catch (e) {
    console.error("Failed to update .env", e);
  }

  res.json({ success: true, message: "Password updated successfully." });
});

// -------------------------------------------------------------
// Local Backup & Download Endpoints
// -------------------------------------------------------------
const BACKUP_DIR = "/var/backups/downloads";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// List generated backup archives
app.get("/api/backup/archives", requireAuth, (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const files = fs.readdirSync(BACKUP_DIR);
    const archives = files
      .filter((f) => f.startsWith("mat-") && (f.endsWith(".tar.gz") || f.endsWith(".gz")))
      .map((filename) => {
        const fullPath = path.join(BACKUP_DIR, filename);
        const stat = fs.statSync(fullPath);
        let type = "full";
        if (filename.includes("-db-")) type = "db";
        else if (filename.includes("-uploads-")) type = "uploads";
        return {
          filename,
          type,
          sizeBytes: stat.size,
          sizeFormatted: formatBytes(stat.size),
          createdAt: stat.mtime
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ archives });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download an archive
app.get("/api/backup/download/:filename", requireAuth, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const fullPath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: "Backup archive not found." });
    }
    res.download(fullPath, filename);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an archive
app.delete("/api/backup/delete/:filename", requireAuth, (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const fullPath = path.join(BACKUP_DIR, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      appendLog("info", `[BACKUP] Deleted archive: ${filename}`);
      return res.json({ success: true, message: `Archive ${filename} deleted.` });
    }
    res.status(404).json({ error: "File not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time System Metrics API
app.get("/api/system-stats", requireAuth, async (req, res) => {
  try {
    const cpuPct = await getCpuUsage();
    const loadAvg = os.loadavg();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Detailed memory from /proc/meminfo if available
    let memDetails = {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usedPct: Math.round((usedMem / totalMem) * 100)
    };

    try {
      const memInfo = fs.readFileSync("/proc/meminfo", "utf8");
      const getVal = (key) => {
        const m = memInfo.match(new RegExp(`^${key}:\\s+(\\d+)`, "m"));
        return m ? parseInt(m[1], 10) * 1024 : null;
      };
      const mTotal = getVal("MemTotal");
      const mAvail = getVal("MemAvailable");
      if (mTotal && mAvail) {
        memDetails = {
          total: mTotal,
          used: mTotal - mAvail,
          free: mAvail,
          usedPct: Math.round(((mTotal - mAvail) / mTotal) * 100)
        };
      }
    } catch (e) {}

    // Disk Usage
    exec("df -h / | tail -n 1", (err, dfOut) => {
      let rootDisk = { size: "77G", used: "6.2G", avail: "71G", usePct: "9%" };
      if (!err && dfOut) {
        const parts = dfOut.trim().split(/\s+/);
        if (parts.length >= 5) {
          rootDisk = {
            size: parts[1],
            used: parts[2],
            avail: parts[3],
            usePct: parts[4]
          };
        }
      }

      // Uploads and Documents folder sizes (cached for performance)
      const now = Date.now();
      if (storageCache.data && now - storageCache.timestamp < 60000) {
        sendResponse(storageCache.data);
      } else {
        exec("du -sh /var/www/uploads /var/www/documents 2>/dev/null", (duErr, duOut) => {
          let uploadsSize = "N/A";
          let documentsSize = "N/A";
          if (!duErr && duOut) {
            const lines = duOut.trim().split("\n");
            for (const line of lines) {
              const [size, p] = line.split(/\s+/);
              if (p && p.includes("uploads")) uploadsSize = size;
              if (p && p.includes("documents")) documentsSize = size;
            }
          }
          storageCache = {
            data: { uploadsSize, documentsSize },
            timestamp: now
          };
          sendResponse(storageCache.data);
        });
      }

      function sendResponse(dirs) {
        // Docker Container Status
        exec('docker ps -a --format "{{json .}}"', (dockerErr, dockerOut) => {
          const containers = [];
          if (!dockerErr && dockerOut) {
            const rawLines = dockerOut.trim().split("\n").filter(Boolean);
            for (const line of rawLines) {
              try {
                const c = JSON.parse(line);
                containers.push({
                  id: c.ID,
                  name: c.Names,
                  image: c.Image,
                  status: c.Status,
                  state: c.State,
                  ports: c.Ports
                });
              } catch (e) {}
            }
          }

          res.json({
            cpu: {
              usagePct: cpuPct,
              cores: os.cpus().length,
              loadAvg: [loadAvg[0].toFixed(2), loadAvg[1].toFixed(2), loadAvg[2].toFixed(2)]
            },
            memory: memDetails,
            disk: {
              root: rootDisk,
              uploads: dirs.uploadsSize,
              documents: dirs.documentsSize
            },
            containers,
            serverUptime: os.uptime(),
            hostname: os.hostname(),
            activeJob: activeJob ? { id: activeJob.id, command: activeJob.command, startedAt: activeJob.startedAt } : null
          });
        });
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Git status and info
app.get("/api/git-info", requireAuth, (req, res) => {
  exec("git rev-parse --short HEAD && git branch --show-current && git log -1 --format=\"%s (%cr) by %an\" && git status --porcelain", { cwd: APP_ROOT }, (err, stdout) => {
    if (err) return res.status(500).json({ error: err.message });
    const lines = stdout.split("\n");
    res.json({
      commit: lines[0] || "",
      branch: lines[1] || "",
      lastCommit: lines[2] || "",
      isDirty: lines.slice(3).filter(Boolean).length > 0
    });
  });
});

// Container Restart
app.post("/api/container/restart", requireAuth, (req, res) => {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Container name is required." });
  }
  // Sanitize container name
  const sanitized = name.replace(/[^a-zA-Z0-9_\-\.]/g, "");
  appendLog("info", `[DOCKER] Requesting restart of container: ${sanitized}`);

  exec(`docker restart ${sanitized}`, (err, stdout, stderr) => {
    if (err) {
      appendLog("stderr", `[ERROR] Failed to restart ${sanitized}: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
    appendLog("stdout", `[SUCCESS] Container ${sanitized} restarted successfully.`);
    res.json({ success: true, message: `Container ${sanitized} restarted.` });
  });
});

// SSE Streaming for Logs & Execution
app.get("/api/terminal/stream", requireAuth, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send historical logs on initial connection
  res.write(`data: ${JSON.stringify({ event: "init", logs: logHistory, activeJob: activeJob ? { id: activeJob.id, command: activeJob.command } : null })}\n\n`);

  sseClients.add(res);
  req.on("close", () => {
    sseClients.delete(res);
  });
});

app.post("/api/terminal/clear", requireAuth, (req, res) => {
  logHistory.length = 0;
  broadcastSSE({ event: "clear" });
  res.json({ success: true });
});

// Abort active running process
app.post("/api/terminal/abort", requireAuth, (req, res) => {
  if (!activeJob || !activeJob.process) {
    return res.status(400).json({ error: "No active command running." });
  }
  appendLog("info", `[ABORT] User triggered abort for process (PID: ${activeJob.process.pid})`);
  try {
    // Kill process group
    process.kill(-activeJob.process.pid, "SIGTERM");
    setTimeout(() => {
      try {
        if (activeJob && activeJob.process) {
          process.kill(-activeJob.process.pid, "SIGKILL");
        }
      } catch (e) {}
    }, 2000);
    res.json({ success: true, message: "Abort signal sent." });
  } catch (err) {
    try {
      activeJob.process.kill("SIGTERM");
      res.json({ success: true, message: "Abort signal sent to single process." });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }
});

// Predefined safe commands
const PREDEFINED_COMMANDS = {
  "git-status": { cmd: "git", args: ["status"], desc: "Git Status" },
  "git-fetch": { cmd: "git", args: ["fetch", "origin", "live"], desc: "Git Fetch live" },
  "git-pull": { cmd: "git", args: ["pull", "origin", "live"], desc: "Git Pull live" },
  "git-force": { cmd: "bash", args: ["-c", "git reset --hard origin/live && git clean -fd"], desc: "Force Sync with Git" },
  "deploy-all": { cmd: "make", args: ["deploy"], desc: "Deploy All (Production)" },
  "build-backend": { cmd: "make", args: ["build-bg"], desc: "Build & Restart Backend" },
  "build-client": { cmd: "make", args: ["build-client"], desc: "Build & Restart Client Dashboard" },
  "build-admin": { cmd: "make", args: ["build-admin"], desc: "Build & Restart Admin Dashboard" },
  "build-front": { cmd: "make", args: ["build-front"], desc: "Build & Restart Frontend" },
  "backup-gcs": { cmd: "/usr/local/bin/mat-daily-backup.sh", args: [], desc: "Daily GCS Backup Script" },
  "backup-full-download": { cmd: "/opt/mat-ops-panel/create-backup.sh", args: ["full"], desc: "Generate Full Backup (DB + Uploads + Documents)" },
  "backup-db-download": { cmd: "/opt/mat-ops-panel/create-backup.sh", args: ["db"], desc: "Generate Database Only Dump (.gz)" },
  "backup-uploads-download": { cmd: "/opt/mat-ops-panel/create-backup.sh", args: ["uploads"], desc: "Generate Uploads & Documents (.tar.gz)" },
  "docker-status": { cmd: "docker", args: ["compose", "-f", "docker-compose.prod.yml", "ps"], desc: "Docker Containers Status" }
};

// Execute Command API
app.post("/api/execute", requireAuth, (req, res) => {
  const { action, customCmd } = req.body;

  if (activeJob) {
    return res.status(409).json({
      error: `Another command (${activeJob.command}) is currently running. Please wait or abort it first.`
    });
  }

  let executable = "";
  let args = [];
  let displayCommand = "";

  if (action && PREDEFINED_COMMANDS[action]) {
    const p = PREDEFINED_COMMANDS[action];
    executable = p.cmd;
    args = p.args;
    displayCommand = `${p.cmd} ${p.args.join(" ")}`;
  } else if (action === "custom" && customCmd) {
    displayCommand = customCmd.trim();
    executable = "bash";
    args = ["-c", displayCommand];
  } else {
    return res.status(400).json({ error: "Invalid action or empty custom command." });
  }

  const jobId = crypto.randomUUID();
  const startTime = Date.now();
  appendLog("header", `=== [START] ${displayCommand} (User: ${req.user.user}) ===`);

  try {
    const child = spawn(executable, args, {
      cwd: APP_ROOT,
      detached: true,
      env: { ...process.env, FORCE_COLOR: "1", TERM: "xterm-256color" }
    });

    activeJob = {
      id: jobId,
      command: displayCommand,
      startedAt: new Date().toISOString(),
      process: child
    };

    broadcastSSE({ event: "job_start", jobId, command: displayCommand });

    child.stdout.on("data", (chunk) => {
      appendLog("stdout", chunk.toString("utf8"));
    });

    child.stderr.on("data", (chunk) => {
      appendLog("stderr", chunk.toString("utf8"));
    });

    child.on("error", (err) => {
      appendLog("error", `[SPAWN ERROR]: ${err.message}`);
    });

    child.on("close", (code, signal) => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      if (signal) {
        appendLog("error", `=== [TERMINATED] Process killed by ${signal} after ${duration}s ===`);
      } else if (code === 0) {
        appendLog("success", `=== [SUCCESS] Process finished successfully (exit code 0) in ${duration}s ===`);
      } else {
        appendLog("error", `=== [FAILED] Process exited with code ${code} after ${duration}s ===`);
      }
      activeJob = null;
      broadcastSSE({ event: "job_end", jobId, code, duration });
    });

    res.json({ success: true, jobId, command: displayCommand });
  } catch (err) {
    activeJob = null;
    appendLog("error", `Failed to start process: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, "127.0.0.1", () => {
  console.log(`[MAT Ops Panel] Listening on http://127.0.0.1:${PORT}`);
});
