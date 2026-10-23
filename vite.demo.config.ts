import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `pnpm dev`: the demo page in demo/, using the editor from src/.
// `pnpm build:demo`: the same page as a static site in demo-dist/ (GitHub
// Pages serves it under /TanEditor/, set through DEMO_BASE).
export default defineConfig({
    root: 'demo',
    base: process.env.DEMO_BASE ?? '/',
    plugins: [react()],
    server: { port: 5180 },
    build: { outDir: '../demo-dist', emptyOutDir: true },
});
