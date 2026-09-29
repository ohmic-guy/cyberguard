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
        soc: {
          dark: '#070B12',
          base: '#0B1120',
          card: '#0F172A',
          hover: '#172540',
          border: '#1E293B',
          muted: '#64748B',
          glow: '#00F0FF',
        },
        risk: {
          safe: '#10B981',
          low: '#38BDF8',
          medium: '#FBBF24',
          high: '#FB923C',
          critical: '#EF4444',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'cyber-sm': '0 0 10px rgba(6, 182, 212, 0.15)',
        'cyber-md': '0 0 20px rgba(6, 182, 212, 0.25)',
        'cyber-danger': '0 0 20px rgba(239, 68, 68, 0.35)',
        'cyber-warning': '0 0 20px rgba(245, 158, 11, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
