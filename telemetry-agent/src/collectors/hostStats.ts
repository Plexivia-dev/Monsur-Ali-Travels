import os from 'os';
import fs from 'fs';
import { HostMetrics } from '../types.js';

let previousCpuIdle = 0;
let previousCpuTotal = 0;

// Collects host CPU, memory, disk, and load average metrics using host procfs or native OS fallbacks
export const collectHostMetrics = async (): Promise<HostMetrics> => {
  try {
    const meminfoPath = fs.existsSync('/host/proc/meminfo') ? '/host/proc/meminfo' : '/proc/meminfo';
    let memTotal = os.totalmem();
    let memFree = os.freemem();

    if (fs.existsSync(meminfoPath)) {
      const content = fs.readFileSync(meminfoPath, 'utf8');
      const totalMatch = content.match(/MemTotal:\s+(\d+)\s+kB/);
      const freeMatch = content.match(/MemAvailable:\s+(\d+)\s+kB/) || content.match(/MemFree:\s+(\d+)\s+kB/);

      if (totalMatch) {
        memTotal = parseInt(totalMatch[1], 10) * 1024;
      }
      if (freeMatch) {
        memFree = parseInt(freeMatch[1], 10) * 1024;
      }
    }

    const memUsed = memTotal - memFree;
    const memPercent = Math.round((memUsed / memTotal) * 10000) / 100;

    // Calculate CPU usage percentage
    const cpus = os.cpus();
    let idle = 0;
    let total = 0;
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        total += (cpu.times as any)[type];
      }
      idle += cpu.times.idle;
    }

    const diffIdle = idle - previousCpuIdle;
    const diffTotal = total - previousCpuTotal;
    previousCpuIdle = idle;
    previousCpuTotal = total;

    const cpuPercent = diffTotal > 0
      ? Math.round((1 - diffIdle / diffTotal) * 10000) / 100
      : 0;

    // Calculate Disk usage
    let diskTotal = 0;
    let diskUsed = 0;
    let diskPercent = 0;

    try {
      const diskRoot = fs.existsSync('/host') ? '/host' : (process.platform === 'win32' ? process.cwd() : '/');
      const stat = fs.statfsSync(diskRoot);
      diskTotal = stat.blocks * stat.bsize;
      const diskFree = stat.bavail * stat.bsize;
      diskUsed = diskTotal - diskFree;
      diskPercent = diskTotal > 0 ? Math.round((diskUsed / diskTotal) * 10000) / 100 : 0;
    } catch (diskErr) {
      // Fallback
    }

    return {
      cpuUsagePercent: Math.max(0, Math.min(100, cpuPercent)),
      memoryUsedBytes: memUsed,
      memoryTotalBytes: memTotal,
      memoryUsagePercent: memPercent,
      diskUsedBytes: diskUsed,
      diskTotalBytes: diskTotal,
      diskUsagePercent: diskPercent,
      uptimeSeconds: os.uptime(),
      loadAverage: os.loadavg() as [number, number, number],
    };
  } catch (error) {
    return {
      cpuUsagePercent: 0,
      memoryUsedBytes: os.totalmem() - os.freemem(),
      memoryTotalBytes: os.totalmem(),
      memoryUsagePercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
      diskUsedBytes: 0,
      diskTotalBytes: 0,
      diskUsagePercent: 0,
      uptimeSeconds: os.uptime(),
      loadAverage: [0, 0, 0],
    };
  }
};
