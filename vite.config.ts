import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  // Project-relative paths to the mkcert generated certificate and private key
  const certPath = fs.existsSync(path.resolve(__dirname, 'certs/localhost.pem'))
    ? path.resolve(__dirname, 'certs/localhost.pem')
    : path.resolve(__dirname, '.certs/localhost.pem');

  const keyPath = fs.existsSync(path.resolve(__dirname, 'certs/localhost-key.pem'))
    ? path.resolve(__dirname, 'certs/localhost-key.pem')
    : path.resolve(__dirname, '.certs/localhost-key.pem');

  const hasCerts = fs.existsSync(certPath) && fs.existsSync(keyPath);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 8000,
      host: '0.0.0.0',
      ...(hasCerts
        ? {
            https: {
              key: fs.readFileSync(keyPath),
              cert: fs.readFileSync(certPath),
            },
          }
        : {}),
      hmr: process.env.DISABLE_HMR !== 'true'
        ? {
            protocol: hasCerts ? 'wss' : 'ws',
            host: 'localhost',
            port: 8000,
          }
        : false,
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: hasCerts ? 'https://localhost:8000' : 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
