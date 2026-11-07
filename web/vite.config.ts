import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: './',
    plugins: [react()],
    build: {
        outDir: '../html',
        emptyOutDir: true,
        assetsDir: '.',
        rollupOptions: { output: { entryFileNames: 'index.js', assetFileNames: 'index[extname]' } },
    },
});
