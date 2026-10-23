/** @type {import('tailwindcss').Config} */
// Builds only the utilities the editor's components use into dist/style.css.
// Colors read the host app's shadcn variables when it has them, with fallbacks
// so the editor also looks right on its own.
export default {
    content: ['./src/**/*.{ts,tsx}'],
    corePlugins: { preflight: false },
    theme: {
        extend: {
            colors: {
                background: 'var(--background, #fff)',
                foreground: 'var(--foreground, #0f172a)',
                popover: {
                    DEFAULT: 'var(--popover, #fff)',
                    foreground: 'var(--popover-foreground, #0f172a)',
                },
                primary: {
                    DEFAULT: 'var(--primary, #1e293b)',
                    foreground: 'var(--primary-foreground, #f8fafc)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary, #f1f5f9)',
                    foreground: 'var(--secondary-foreground, #1e293b)',
                },
                muted: {
                    DEFAULT: 'var(--muted, #f1f5f9)',
                    foreground: 'var(--muted-foreground, #64748b)',
                },
                accent: {
                    DEFAULT: 'var(--accent, #f1f5f9)',
                    foreground: 'var(--accent-foreground, #1e293b)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive, #dc2626)',
                    foreground: 'var(--destructive-foreground, #fff)',
                },
                border: 'var(--border, #e2e8f0)',
                input: 'var(--input, #e2e8f0)',
                ring: 'var(--ring, #94a3b8)',
            },
            borderRadius: {
                lg: 'var(--radius, 0.625rem)',
                md: 'calc(var(--radius, 0.625rem) - 2px)',
                sm: 'calc(var(--radius, 0.625rem) - 4px)',
            },
        },
    },
    plugins: [],
};
