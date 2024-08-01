import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import ssl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [ssl(), vue()],
});
