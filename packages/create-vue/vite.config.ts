import { defineConfig, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import ssl from '@vitejs/plugin-basic-ssl';

const plugins: PluginOption[] = [vue()];
if (process.env.npm_lifecycle_event === 'dev:ssl') {
  plugins.push(ssl());
}

// https://vitejs.dev/config/
export default defineConfig({ plugins });
