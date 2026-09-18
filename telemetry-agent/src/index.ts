import dotenv from 'dotenv';
import { collectHostMetrics } from './collectors/hostStats.js';
import { queryDockerContainers } from './collectors/dockerStats.js';
import { PlexiNodeWsClient } from './client/wsClient.js';
import { TelemetryPacket } from './types.js';

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID || 'EP01';
const NODE_ID = process.env.NODE_ID || 'vps_mat_prod';
const NODE_NAME = process.env.NODE_NAME || 'Monsur Ali Travels Production VPS';
const CONTROL_PLANE_URL = process.env.CONTROL_PLANE_URL || 'wss://hub.plexivia.online/ws/telemetry';
const AGENT_TOKEN = process.env.AGENT_TOKEN || 'plexivia_sec_mat_token_2026';
const INTERVAL_MS = parseInt(process.env.TELEMETRY_INTERVAL_MS || '5000', 10);

// Initializes and orchestrates the telemetry reporting lifecycle of the node agent
const bootstrapAgent = () => {
  console.log(`====================================================`);
  console.log(`  Monsur Ali Travels — Plexivia Telemetry Daemon    `);
  console.log(`  Client ID: ${CLIENT_ID}`);
  console.log(`  Node ID: ${NODE_ID}`);
  console.log(`  Control Plane: ${CONTROL_PLANE_URL}`);
  console.log(`  Interval: ${INTERVAL_MS}ms`);
  console.log(`====================================================`);

  const client = new PlexiNodeWsClient({
    controlPlaneUrl: CONTROL_PLANE_URL,
    clientId: CLIENT_ID,
    nodeId: NODE_ID,
    nodeName: NODE_NAME,
    agentToken: AGENT_TOKEN,
  });

  client.connect();

  // Periodic telemetry loop
  setInterval(async () => {
    try {
      const host = await collectHostMetrics();
      const containers = await queryDockerContainers();

      let alertCandidate: TelemetryPacket['alertCandidate'];

      if (host.memoryUsagePercent >= 90) {
        alertCandidate = {
          type: 'HIGH_RAM',
          details: {
            usagePercent: host.memoryUsagePercent,
            usedBytes: host.memoryUsedBytes,
            totalBytes: host.memoryTotalBytes,
          },
        };
      } else if (host.diskUsagePercent >= 90) {
        alertCandidate = {
          type: 'HIGH_DISK',
          details: {
            usagePercent: host.diskUsagePercent,
            usedBytes: host.diskUsedBytes,
            totalBytes: host.diskTotalBytes,
          },
        };
      }

      const packet: TelemetryPacket = {
        nodeId: NODE_ID,
        clientId: CLIENT_ID,
        nodeName: NODE_NAME,
        timestamp: new Date().toISOString(),
        host,
        containers,
        alertCandidate,
      };

      client.sendTelemetry(packet);
    } catch (err: any) {
      console.error('[MAT-Agent] Telemetry dispatch tick failed:', err.message);
    }
  }, INTERVAL_MS);
};

bootstrapAgent();
