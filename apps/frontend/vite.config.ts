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
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', '@vue/runtime-core', '@vue/runtime-dom'],
          'pinia-vendor': ['pinia'],
          'ui-vendor': ['@headlessui/vue', '@heroicons/vue']
        }
      }
    },
    commonjsOptions: {
      esmExternals: true
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['vue', 'vue-router', 'pinia']
  },
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@headlessui/vue',
      '@heroicons/vue'
    ],
    exclude: ['vue-demi']
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
      imports: ['vue', VueRouterAutoImports, 'pinia', ],
      dts: true, 
      viteOptimizeDeps: true
    }), 
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    pinia
  ],
  server: {
    port: 3000,
  },
});
