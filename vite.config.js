import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 相对路径可直接部署到 https://用户名.github.io/仓库名/
  base: './',
});
