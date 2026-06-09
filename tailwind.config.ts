import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--surface-canvas)',
        sunken: 'var(--surface-sunken)',
        card: 'var(--surface-card)',
        raised: 'var(--surface-raised)',
        inverse: 'var(--surface-inverse)',
        well: 'var(--surface-well)',
        primary: 'var(--brand-primary)',
        'primary-hover': 'var(--brand-primary-hover)',
        accent: 'var(--brand-accent)',
        'accent-hover': 'var(--brand-accent-hover)',
        'text-strong': 'var(--text-strong)',
        'text-body': 'var(--text-body)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-inverse': 'var(--text-inverse)',
        border: 'var(--border-default)',
        'border-strong': 'var(--border-strong)',
      },
      fontFamily: {
        display: ['Spectral', 'Georgia', 'serif'],
        body: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)',
      },
      boxShadow: {
        xs: 'var(--shadow-xs)',
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
    },
  },
} satisfies Config
