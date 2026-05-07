import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
                'resources/js/gakudo-lp.tsx',
                'resources/css/sales-tool.css',
                'resources/js/sales-tool/sales-tool.js',
            ],
            refresh: true,
        }),
        react(),
    ],
});
