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
        // Cyberpunk / Glitch Design System Tokens
        background: '#0a0a0f',
        foreground: '#e0e0e0',
        card: '#12121a',
        muted: '#1c1c2e',
        mutedForeground: '#6b7280',
        accent: {
          DEFAULT: '#00ff88', // Primary Neon - Electric Matrix Green
          secondary: '#ff00ff', // Secondary Neon - Hot Magenta
          tertiary: '#00d4ff', // Tertiary Neon - Cyan / Electric Blue
        },
        border: '#2a2a3a',
        input: '#12121a',
        ring: '#00ff88',
        destructive: '#ff3366',

        // Legacy & SOC Mappings for Backwards Compatibility
        soc: {
          dark: '#0a0a0f',
          base: '#0f1017',
          card: '#12121a',
          hover: '#1c1c2e',
          border: '#2a2a3a',
          muted: '#6b7280',
          glow: '#00ff88',
          cyan: '#00d4ff',
          magenta: '#ff00ff',
        },
        risk: {
          safe: '#00ff88',
          low: '#00d4ff',
          medium: '#ffb800',
          high: '#ff8800',
          critical: '#ff3366',
        },
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        tech: ['var(--font-share-tech-mono)', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 5px #00ff88, 0 0 10px rgba(0, 255, 136, 0.4)',
        'neon-sm': '0 0 3px #00ff88, 0 0 6px rgba(0, 255, 136, 0.3)',
        'neon-lg': '0 0 10px #00ff88, 0 0 20px rgba(0, 255, 136, 0.6), 0 0 40px rgba(0, 255, 136, 0.3)',
        'neon-secondary': '0 0 5px #ff00ff, 0 0 20px rgba(255, 0, 255, 0.6)',
        'neon-tertiary': '0 0 5px #00d4ff, 0 0 20px rgba(0, 212, 255, 0.6)',
        'neon-danger': '0 0 5px #ff3366, 0 0 20px rgba(255, 51, 102, 0.6)',
        'cyber-sm': '0 0 10px rgba(0, 255, 136, 0.25)',
        'cyber-md': '0 0 20px rgba(0, 255, 136, 0.4)',
        'cyber-danger': '0 0 20px rgba(255, 51, 102, 0.45)',
        'cyber-warning': '0 0 20px rgba(255, 184, 0, 0.4)',
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'glitch': 'glitch 2.5s infinite',
        'rgb-shift': 'rgbShift 3s ease-in-out infinite alternate',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(2px, -2px)' },
          '60%': { transform: 'translate(-1px, -1px)' },
          '80%': { transform: 'translate(1px, 1px)' },
        },
        rgbShift: {
          '0%, 100%': { textShadow: '-2px 0 #ff00ff, 2px 0 #00d4ff' },
          '50%': { textShadow: '2px 0 #ff00ff, -2px 0 #00d4ff' },
        },
        blink: {
          '50%': { opacity: '0' },
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

