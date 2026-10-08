import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Minimal dark design system
        background: '#0d0f14',
        foreground: '#c9d1d9',
        card: '#161b22',
        muted: '#1c2128',
        mutedForeground: '#6e7681',
        accent: {
          DEFAULT: '#58a6ff',
          success: '#3fb950',
          warning: '#d29922',
          danger: '#f85149',
        },
        border: '#21262d',
        input: '#161b22',
        ring: '#58a6ff',
        destructive: '#f85149',

        // Risk level colors
        risk: {
          safe: '#8b949e',
          low: '#3fb950',
          medium: '#58a6ff',
          high: '#d29922',
          critical: '#f85149',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        // Keep orbitron as fallback to avoid errors in any remaining usages
        orbitron: ['var(--font-inter)', 'sans-serif'],
        tech: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        // Minimal shadows only
        'card': '0 1px 3px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {},
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;

