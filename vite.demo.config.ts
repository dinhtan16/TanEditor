import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `pnpm dev`: the demo page in demo/, using the editor from src/
export default defineConfig({
    root: 'demo',
    plugins: [react()],
    server: { port: 5180 },
});
