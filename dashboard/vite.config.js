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

// Contextual alias resolver for seamless MPA transition
function contextualAliasPlugin() {
  return {
    name: 'contextual-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (source.startsWith('@/')) {
        const subPath = source.slice(2);
        if (importer) {
          const normImporter = importer.replace(/\\/g, '/');
          
          if (normImporter.includes('/src/admin/')) {
            const found =
              findFile(path.resolve(__dirname, 'src/admin'), subPath) ||
              findFile(path.resolve(__dirname, 'src/shared'), subPath) ||
              findFile(path.resolve(__dirname, 'src'), subPath);
            if (found) return found;
          } else if (normImporter.includes('/src/client/')) {
            const found =
              findFile(path.resolve(__dirname, 'src/client'), subPath) ||
              findFile(path.resolve(__dirname, 'src/shared'), subPath) ||
              findFile(path.resolve(__dirname, 'src'), subPath);
            if (found) return found;
          } else if (normImporter.includes('/src/shared/')) {
            const found =
              findFile(path.resolve(__dirname, 'src/shared'), subPath) ||
              findFile(path.resolve(__dirname, 'src'), subPath);
            if (found) return found;
          }
        }
        const defaultFound = findFile(path.resolve(__dirname, 'src'), subPath);
        if (defaultFound) return defaultFound;
      }

      if (source.startsWith('@shared/')) {
        const found = findFile(path.resolve(__dirname, 'src/shared'), source.slice(8));
        if (found) return found;
      }
      if (source.startsWith('@admin/')) {
        const found = findFile(path.resolve(__dirname, 'src/admin'), source.slice(7));
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

// Custom MPA history fallback plugin for seamless dev-server routing
function mpaHistoryFallbackPlugin() {
  return {
    name: 'mpa-history-fallback',
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
          if (url.startsWith('/admin')) {
            req.url = '/admin.html';
          } else if (
            url.startsWith('/agency') ||
            url.startsWith('/docs') ||
            url.startsWith('/factory') ||
            url.startsWith('/data') ||
            url.startsWith('/tasks') ||
            url.startsWith('/client')
          ) {
            req.url = '/client.html';
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contextualAliasPlugin(), mpaHistoryFallbackPlugin()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
      '@admin': path.resolve(__dirname, './src/admin'),
      '@client': path.resolve(__dirname, './src/client'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        admin: path.resolve(__dirname, 'admin.html'),
        client: path.resolve(__dirname, 'client.html'),
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
});
