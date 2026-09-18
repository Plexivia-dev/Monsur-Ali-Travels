import http from 'http';
import fs from 'fs';
import { ContainerInfo } from '../types.js';

// Queries the local Docker socket HTTP API for container lists and their current runtime statuses
export const queryDockerContainers = (): Promise<ContainerInfo[]> => {
  return new Promise((resolve) => {
    const socketPath = process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock';

    if (!fs.existsSync(socketPath)) {
      resolve([]);
      return;
    }

    const options: http.RequestOptions = {
      socketPath,
      path: '/containers/json?all=1',
      method: 'GET',
      headers: {
        Host: 'docker.sock',
      },
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const rawContainers = JSON.parse(data);
            const containers: ContainerInfo[] = rawContainers.map((c: any) => ({
              id: c.Id.substring(0, 12),
              names: c.Names || [],
              image: c.Image || '',
              state: c.State || '',
              status: c.Status || '',
            }));
            resolve(containers);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve([]);
    });

    req.end();
  });
};
