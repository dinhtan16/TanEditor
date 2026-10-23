import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';
import pkg from './package.json' with { type: 'json' };

// Peer and runtime dependencies stay external: the host app provides one copy.
const external = [
    ...Object.keys(pkg.peerDependencies),
    ...Object.keys(pkg.dependencies),
];

export default defineConfig({
    plugins: [
        react(),
        dts({ include: ['src'], rollupTypes: true, tsconfigPath: './tsconfig.json' }),
    ],
    build: {
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.ts'),
            formats: ['es'],
            fileName: 'index',
            cssFileName: 'style',
        },
        cssCodeSplit: false,
        sourcemap: true,
        rollupOptions: {
            external: id =>
                external.some(dep => id === dep || id.startsWith(`${dep}/`)),
            // The editor uses hooks and the DOM: a client component in Next.js
            output: { banner: "'use client';" },
        },
    },
});
