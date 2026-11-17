import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`            → normal production build in dist/
// `npm run build:standalone` → one self-contained HTML file (dist-standalone/index.html)
//                              that opens by double-click, no server needed.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'standalone' ? [viteSingleFile()] : [])],
  build:
    mode === 'standalone'
      ? { outDir: 'dist-standalone', assetsInlineLimit: 100_000_000 }
      : { outDir: 'dist' },
  server: { host: true, port: 5173 },
}));
