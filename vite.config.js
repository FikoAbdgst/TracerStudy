import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
                    if (id.includes('node_modules/@inertiajs/react')) return 'vendor-inertia';
                    if (id.includes('node_modules/@radix-ui/')) return 'vendor-radix';
                    if (id.includes('node_modules/@headlessui/')) return 'vendor-headlessui';
                    if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'vendor-maps';
                    if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
                },
            },
        },
    },
});
