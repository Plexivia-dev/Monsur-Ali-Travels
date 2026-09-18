export enum AllowedAgentAction {
  RESTART_CONTAINER = 'ACTION_RESTART_CONTAINER',
  FETCH_LOGS = 'ACTION_FETCH_LOGS',
  GIT_PULL = 'ACTION_GIT_PULL',
  DOCKER_DEPLOY = 'ACTION_DOCKER_DEPLOY',
  EXEC_COMMAND = 'ACTION_EXEC_COMMAND',
  MAT_DEPLOY = 'ACTION_MAT_DEPLOY',
  MAT_BUILD_BACKEND = 'ACTION_MAT_BUILD_BACKEND',
  MAT_BUILD_CLIENT = 'ACTION_MAT_BUILD_CLIENT',
  MAT_BUILD_ADMIN = 'ACTION_MAT_BUILD_ADMIN',
  MAT_BUILD_FRONT = 'ACTION_MAT_BUILD_FRONT',
  MAT_STATUS = 'ACTION_MAT_STATUS',
}

export interface HostMetrics {
  cpuUsagePercent: number;
  memoryUsedBytes: number;
  memoryTotalBytes: number;
  memoryUsagePercent: number;
  diskUsedBytes: number;
  diskTotalBytes: number;
  diskUsagePercent: number;
  uptimeSeconds: number;
  loadAverage: [number, number, number];
}

export interface ContainerInfo {
  id: string;
  names: string[];
  image: string;
  state: string;
  status: string;
}

export interface TelemetryPacket {
  nodeId: string;
  clientId: string;
  nodeName: string;
  timestamp: string;
  host: HostMetrics;
  containers: ContainerInfo[];
  alertCandidate?: {
    type: 'HIGH_RAM' | 'HIGH_CPU' | 'HIGH_DISK' | 'CONTAINER_CRASH';
    details: Record<string, any>;
  };
}

export interface AgentActionCommand {
  actionId: string;
  action: AllowedAgentAction;
  targetContainer?: string;
  options?: {
    tailLines?: number;
    command?: string;
    targetDir?: string;
    branch?: string;
  };
}

export interface AgentActionResult {
  actionId: string;
  success: boolean;
  message: string;
  output?: string;
  timestamp: string;
}
