import http from 'http';
import fs from 'fs';
import { exec } from 'child_process';
import util from 'util';
import { AllowedAgentAction, AgentActionCommand, AgentActionResult } from '../types.js';

const execAsync = util.promisify(exec);

// Sends a low-level HTTP command directly to the Docker engine via unix domain socket
const dockerApiRequest = (method: string, path: string): Promise<{ statusCode: number; body: string }> => {
  return new Promise((resolve, reject) => {
    const socketPath = process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock';

    if (!fs.existsSync(socketPath)) {
      reject(new Error(`Docker socket not found at ${socketPath}`));
      return;
    }

    const req = http.request(
      {
        socketPath,
        path,
        method,
        headers: { Host: 'docker.sock' },
        timeout: 15000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode || 500, body });
        });
      }
    );

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Docker API request timed out'));
    });

    req.end();
  });
};

const isSafeIdentifier = (name: string): boolean => {
  return /^[a-zA-Z0-9_\-\.\/:]+$/.test(name);
};

// Strictly allowlisted terminal command prefixes
const ALLOWED_TERMINAL_COMMAND_PREFIXES = [
  'git status',
  'git log',
  'git pull',
  'git branch',
  'git fetch',
  'make ',
  'docker ps',
  'docker stats --no-stream',
  'docker compose ps',
  'docker compose -f docker-compose.prod.yml ps',
  'df -h',
  'free -m',
  'uptime',
  'ls -la',
  'node -v',
  'npm -v',
];

// Executes guarded administrative actions on the host daemon
export const executeAgentAction = async (command: AgentActionCommand): Promise<AgentActionResult> => {
  const timestamp = new Date().toISOString();
  const targetDir = command.options?.targetDir || process.env.APP_PROJECT_DIR || '/opt/monsuralitravels';

  if (!Object.values(AllowedAgentAction).includes(command.action)) {
    return {
      actionId: command.actionId,
      success: false,
      message: `Security Violation: Unauthorized action "${command.action}" rejected`,
      timestamp,
    };
  }

  try {
    switch (command.action) {
      case AllowedAgentAction.RESTART_CONTAINER: {
        const target = command.targetContainer || '';
        if (!isSafeIdentifier(target)) {
          return { actionId: command.actionId, success: false, message: `Security Violation: Invalid container target "${target}"`, timestamp };
        }
        const res = await dockerApiRequest('POST', `/containers/${encodeURIComponent(target)}/restart?t=10`);
        const success = res.statusCode === 204 || res.statusCode === 200;
        return {
          actionId: command.actionId,
          success,
          message: success
            ? `Successfully restarted container "${target}"`
            : `Failed to restart container "${target}": HTTP ${res.statusCode} ${res.body}`,
          timestamp,
        };
      }

      case AllowedAgentAction.FETCH_LOGS: {
        const target = command.targetContainer || '';
        if (!isSafeIdentifier(target)) {
          return { actionId: command.actionId, success: false, message: `Security Violation: Invalid container target "${target}"`, timestamp };
        }
        const tail = command.options?.tailLines || 100;
        const res = await dockerApiRequest(
          'GET',
          `/containers/${encodeURIComponent(target)}/logs?stdout=1&stderr=1&tail=${tail}&timestamps=1`
        );
        const success = res.statusCode === 200;
        return {
          actionId: command.actionId,
          success,
          message: success
            ? `Retrieved last ${tail} log lines for "${target}"`
            : `Failed to fetch logs for "${target}": HTTP ${res.statusCode}`,
          output: res.body,
          timestamp,
        };
      }

      case AllowedAgentAction.GIT_PULL: {
        const branch = command.options?.branch || 'live';
        if (!isSafeIdentifier(branch)) {
          return { actionId: command.actionId, success: false, message: 'Invalid branch name', timestamp };
        }
        console.log(`[ActionRunner] Executing git pull in ${targetDir} on branch ${branch}`);
        const { stdout, stderr } = await execAsync(`git pull origin ${branch}`, { cwd: targetDir });
        return {
          actionId: command.actionId,
          success: true,
          message: `Git pull completed successfully on branch "${branch}"`,
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.DOCKER_DEPLOY:
      case AllowedAgentAction.MAT_DEPLOY: {
        console.log(`[ActionRunner] Executing "make deploy" in ${targetDir}`);
        const { stdout, stderr } = await execAsync(`make deploy`, { cwd: targetDir, timeout: 300000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'MAT Production deployment ("make deploy") completed successfully',
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.MAT_BUILD_BACKEND: {
        console.log(`[ActionRunner] Executing "make build-bg" in ${targetDir}`);
        const { stdout, stderr } = await execAsync(`make build-bg`, { cwd: targetDir, timeout: 180000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'Backend container rebuild ("make build-bg") completed successfully',
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.MAT_BUILD_ADMIN: {
        console.log(`[ActionRunner] Executing "make build-admin" in ${targetDir}`);
        const { stdout, stderr } = await execAsync(`make build-admin`, { cwd: targetDir, timeout: 180000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'Admin Dashboard rebuild ("make build-admin") completed successfully',
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.MAT_BUILD_CLIENT: {
        console.log(`[ActionRunner] Executing "make build-client" in ${targetDir}`);
        const { stdout, stderr } = await execAsync(`make build-client`, { cwd: targetDir, timeout: 180000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'Client Dashboard rebuild ("make build-client") completed successfully',
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.MAT_BUILD_FRONT: {
        console.log(`[ActionRunner] Executing "make build-front" in ${targetDir}`);
        const { stdout, stderr } = await execAsync(`make build-front`, { cwd: targetDir, timeout: 180000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'Frontend landing site rebuild ("make build-front") completed successfully',
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.MAT_STATUS: {
        console.log(`[ActionRunner] Executing "make status" in ${targetDir}`);
        const { stdout, stderr } = await execAsync(`make status`, { cwd: targetDir, timeout: 15000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'Status check ("make status") completed',
          output: stdout || stderr,
          timestamp,
        };
      }

      case AllowedAgentAction.EXEC_COMMAND: {
        const rawCmd = (command.options?.command || '').trim();
        const isAllowed = ALLOWED_TERMINAL_COMMAND_PREFIXES.some((prefix) => rawCmd.startsWith(prefix));
        if (!isAllowed) {
          return {
            actionId: command.actionId,
            success: false,
            message: `Security Violation: Command "${rawCmd}" is not in the allowed admin execution list.`,
            timestamp,
          };
        }

        const { stdout, stderr } = await execAsync(rawCmd, { cwd: targetDir, timeout: 60000 });
        return {
          actionId: command.actionId,
          success: true,
          message: 'Command executed successfully',
          output: stdout || stderr,
          timestamp,
        };
      }

      default:
        return {
          actionId: command.actionId,
          success: false,
          message: 'Unsupported action',
          timestamp,
        };
    }
  } catch (err: any) {
    return {
      actionId: command.actionId,
      success: false,
      message: `Action execution error: ${err.message}`,
      output: err.stdout || err.stderr || err.message,
      timestamp,
    };
  }
};
