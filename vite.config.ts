import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import { VueRouterAutoImports } from 'unplugin-vue-router'
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer"
import AutoImport from 'unplugin-auto-import/vite';
import * as zod from "zod";
import pinia from 'pinia'

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
  plugins: [
    VueRouter(),
    AutoImport({
      include: [
    /\.[tj]sx?$/,
    /\.vue$/,
    /\.vue\?vue/,
    /\.md$/,
  ],
      imports: ['vue', VueRouterAutoImports, 'pinia'],
      dts: true, 
      viteOptimizeDeps: true
    }), vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
