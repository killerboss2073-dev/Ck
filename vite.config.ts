import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import type {IncomingMessage, ServerResponse} from 'http';

// CORS Proxy middleware for external lottery API endpoints
function apiProxyPlugin(): Plugin {
  return {
    name: 'api-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/proxy', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method === 'OPTIONS') {
          res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, Ar-Origin',
          });
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.writeHead(405, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: 'Method not allowed'}));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            const {targetUrl, method = 'POST', headers = {}, data = {}} = parsed;

            if (!targetUrl || typeof targetUrl !== 'string') {
              res.writeHead(400, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({error: 'targetUrl is required'}));
              return;
            }

            const fetchHeaders: Record<string, string> = {
              'Accept': 'application/json, text/plain, */*',
              'Content-Type': 'application/json;charset=UTF-8',
              'Ar-Origin': headers['Ar-Origin'] || 'https://www.cklottery.cc',
              ...headers,
            };

            const response = await fetch(targetUrl, {
              method,
              headers: fetchHeaders,
              body: method === 'POST' ? JSON.stringify(data) : undefined,
            });

            const responseData = await response.text();
            res.writeHead(response.status, {
              'Content-Type': response.headers.get('content-type') || 'application/json',
              'Access-Control-Allow-Origin': '*',
            });
            res.end(responseData);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            res.writeHead(500, {'Content-Type': 'application/json'});
            res.end(JSON.stringify({error: 'Proxy request failed', details: message}));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
