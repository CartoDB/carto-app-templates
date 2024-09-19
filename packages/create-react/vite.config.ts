import { defineConfig, PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import ssl from '@vitejs/plugin-basic-ssl';

const plugins: PluginOption[] = [react()];
if (process.env.npm_lifecycle_event === 'dev:ssl') {
  plugins.push(ssl());
}

// https://vitejs.dev/config/
export default defineConfig({ plugins });
