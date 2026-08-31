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

function clientAliasPlugin() {
  return {
    name: 'client-alias-plugin',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('@/')) {
        const subPath = source.slice(2);
        const found =
          findFile(path.resolve(__dirname, 'src/client'), subPath) ||
          findFile(path.resolve(__dirname, 'src/shared'), subPath) ||
          findFile(path.resolve(__dirname, 'src'), subPath);
        if (found) return found;
      }
      if (source.startsWith('@shared/')) {
        const found = findFile(path.resolve(__dirname, 'src/shared'), source.slice(8));
        if (found) return found;
      }
      if (source.startsWith('@client/')) {
        const found = findFile(path.resolve(__dirname, 'src/client'), source.slice(8));
        if (found) return found;
      }
      return null;
    },
  };
}

function clientServerMiddleware() {
  return {
    name: 'client-server-middleware',
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
          req.url = '/client.html';
        }
        next();
      });
    },
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist/client');
      const clientHtml = path.resolve(distDir, 'client.html');
      const indexHtml = path.resolve(distDir, 'index.html');
      if (fs.existsSync(clientHtml)) {
        fs.copyFileSync(clientHtml, indexHtml);
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), clientAliasPlugin(), clientServerMiddleware()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@client': path.resolve(__dirname, './src/client'),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-is',
      '@tanstack/react-query',
      '@tanstack/react-table',
      'lucide-react',
      'recharts',
      'axios',
      'zustand',
      'sonner',
      'clsx',
      'tailwind-merge',
      'class-variance-authority',
      'qrcode',
      'motion',
      'html-to-image',
      'socket.io-client',
      'i18next',
      'react-i18next',
      'i18next-browser-languagedetector',
      '@base-ui/react/tabs',
      '@base-ui/react/collapsible',
      '@base-ui/react/dialog',
      '@base-ui/react/separator',
      '@base-ui/react/merge-props',
      '@base-ui/react/use-render',
      '@base-ui/react/switch',
      '@base-ui/react/avatar',
      '@base-ui/react/menu',
      '@base-ui/react/select',
      '@base-ui/react/toast',
      '@base-ui/react/tooltip',
    ],
  },
  server: {
    port: 8004,
    strictPort: false,
    host: '127.0.0.1',
    open: false,
  },
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        client: path.resolve(__dirname, 'client.html'),
      },
    },
  },
});
