import path from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import VueRouter from "unplugin-vue-router/vite";
import { VueRouterAutoImports } from 'unplugin-vue-router'
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer"
import AutoImport from 'unplugin-auto-import/vite';
import * as zod from "zod";

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
    minify: 'esbuild',
    target: 'esnext',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    emptyOutDir: true,
    reportCompressedSize: false
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
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-')
        }
      }
    }),
    VueRouter(),
    AutoImport({
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
        /\.vue\?vue/,
        /\.md$/,
      ],
      imports: [
        'vue',
        VueRouterAutoImports,
        {
          'pinia': [
            'createPinia',
            'defineStore',
            'storeToRefs'
          ]
        }
      ],
      dts: true,
      viteOptimizeDeps: true
    })
  ],
  server: {
    port: 3000,
  },
});
