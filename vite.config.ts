import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// Vite configuration optimized for Cloudflare Pages deployment.
// - `base: './'` produces relative asset URLs that work on Pages.
// - manualChunks splits heavy vendor libraries so no single bundle stays huge.
export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      watch: null,
      // Allow the sandbox/preview host to reach the dev server.
      allowedHosts: true as const,
    },
    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: false,
      // Cap that avoids noisy warnings; real size is controlled via manualChunks below.
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'chart-vendor': ['d3'],
            'excel-vendor': ['xlsx'],
            'motion-vendor': ['motion'],
            'icons-vendor': ['lucide-react'],
          },
        },
      },
    },
  };
});
