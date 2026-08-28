import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSIONS = ['', '.jsx', '.js', '.ts', '.tsx', '.json', '.css', '/index.jsx', '/index.js', '/index.ts', '/index.tsx'];

function findFile(baseDir, subPath) {
  for (const ext of EXTENSIONS) {
    const full = path.resolve(baseDir, subPath + ext);
    if (fs.existsSync(full) && fs.statSync(full).isFile()) {
      return full;
    }
  }
  return null;
}

function adminAliasPlugin() {
  return {
    name: 'admin-alias-plugin',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('@/')) {
        const subPath = source.slice(2);
        const found =
          findFile(path.resolve(__dirname, 'src/admin'), subPath) ||
          findFile(path.resolve(__dirname, 'src/shared'), subPath) ||
          findFile(path.resolve(__dirname, 'src'), subPath);
        if (found) return found;
      }
      if (source.startsWith('@shared/')) {
        const found = findFile(path.resolve(__dirname, 'src/shared'), source.slice(8));
        if (found) return found;
      }
      if (source.startsWith('@admin/')) {
        const found = findFile(path.resolve(__dirname, 'src/admin'), source.slice(7));
        if (found) return found;
      }
      return null;
    },
  };
}

function adminServerMiddleware() {
  return {
    name: 'admin-server-middleware',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url || '';
        if (
          !url.includes('.') &&
          !url.startsWith('/@') &&
          !url.startsWith('/src') &&
          !url.startsWith('/api') &&
          !url.startsWith('/node_modules')
        ) {
          req.url = '/admin.html';
        }
        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist/admin');
      const adminHtml = path.resolve(distDir, 'admin.html');
      const indexHtml = path.resolve(distDir, 'index.html');
      if (fs.existsSync(adminHtml)) {
        fs.copyFileSync(adminHtml, indexHtml);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), adminAliasPlugin(), adminServerMiddleware()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@admin': path.resolve(__dirname, './src/admin'),
    },
  },
  server: {
    port: 8005,
    host: '127.0.0.1',
    open: false,
    proxy: {
      '/uploads': {
        target: 'https://api.monsuralitravels.com',
        changeOrigin: true,
        secure: false,
      },
      '/documents': {
        target: 'https://api.monsuralitravels.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist/admin',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'admin.html'),
      },
    },
  },
});
