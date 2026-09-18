import WebSocket from 'ws';
import { TelemetryPacket, AgentActionCommand } from '../types.js';
import { executeAgentAction } from '../executor/actionRunner.js';

export interface WsClientOptions {
  controlPlaneUrl: string;
  clientId: string;
  nodeId: string;
  nodeName: string;
  agentToken: string;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

// Manages real-time reverse WebSocket connection between the Node Agent and the Central Control Plane
export class PlexiNodeWsClient {
  private ws: WebSocket | null = null;
  private isDestroyed = false;
  private reconnectAttempts = 0;
  private readonly options: WsClientOptions;

  constructor(options: WsClientOptions) {
    this.options = options;
  }

  // Establishes the WebSocket connection with automatic backoff reconnection
  connect = (): void => {
    if (this.isDestroyed) return;

    const clientId = this.options.clientId || this.options.nodeId;
    console.log(`[MAT-Agent] Connecting to Central Control Plane: ${this.options.controlPlaneUrl} (Client: ${clientId})`);

    try {
      this.ws = new WebSocket(this.options.controlPlaneUrl, {
        headers: {
          'x-client-id': clientId,
          'x-node-id': this.options.nodeId,
          'x-node-name': this.options.nodeName,
          'authorization': `Bearer ${this.options.agentToken}`,
        },
      });

      this.ws.on('open', () => {
        console.log(`[MAT-Agent] Successfully connected to Control Plane as "${this.options.nodeName}" (ClientID: ${clientId})`);
        this.reconnectAttempts = 0;
        if (this.options.onConnected) this.options.onConnected();

        // Send initial registration packet
        this.sendPacket({
          type: 'NODE_REGISTER',
          clientId,
          nodeId: this.options.nodeId,
          nodeName: this.options.nodeName,
          timestamp: new Date().toISOString(),
        });
      });

      this.ws.on('message', async (data: WebSocket.RawData) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === 'EXECUTE_ACTION') {
            const command = message.command as AgentActionCommand;
            console.log(`[MAT-Agent] Received action request: ${command.action} (Target: ${command.targetContainer || 'Host'})`);
            const result = await executeAgentAction(command);
            this.sendPacket({
              type: 'ACTION_RESULT',
              result,
            });
          }
        } catch (err: any) {
          console.error('[MAT-Agent] Failed to handle incoming control plane message:', err.message);
        }
      });

      this.ws.on('close', (code, reason) => {
        console.warn(`[MAT-Agent] WebSocket disconnected (Code: ${code}, Reason: ${reason.toString() || 'none'})`);
        if (this.options.onDisconnected) this.options.onDisconnected();
        this.scheduleReconnect();
      });

      this.ws.on('error', (err) => {
        console.error('[MAT-Agent] WebSocket connection error:', err.message);
      });
    } catch (err: any) {
      console.error('[MAT-Agent] Fatal connection initiation error:', err.message);
      this.scheduleReconnect();
    }
  };

  // Sends telemetry payload to the connected control plane
  sendTelemetry = (packet: TelemetryPacket): boolean => {
    return this.sendPacket({
      type: 'TELEMETRY_DATA',
      payload: packet,
    });
  };

  // Transmits a structured JSON packet if socket is in open state
  private sendPacket = (data: Record<string, any>): boolean => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    return false;
  };

  // Schedules exponential backoff reconnection attempt
  private scheduleReconnect = (): void => {
    if (this.isDestroyed) return;
    this.reconnectAttempts++;
    const delay = Math.min(30000, Math.pow(2, Math.min(this.reconnectAttempts, 5)) * 1000);
    console.log(`[MAT-Agent] Reconnecting in ${delay / 1000}s (Attempt #${this.reconnectAttempts})...`);
    setTimeout(() => this.connect(), delay);
  };

  // Gracefully terminates WebSocket connection and halts reconnection timers
  destroy = (): void => {
    this.isDestroyed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  };
}
