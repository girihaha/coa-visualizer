/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy dark palette kept for reference but no longer used as primary
        ink: {
          50: '#f2f5f7',
          100: '#e3e9ed',
          200: '#c5d0d8',
          300: '#9aaab5',
          400: '#74858f',
          500: '#56656f',
          600: '#3e4b54',
          700: '#2a353d',
          800: '#1c252c',
          850: '#151d23',
          900: '#10171c',
          950: '#0a1014',
        },
        // Academic bright palette
        lab: {
          bg: '#f8fafc',       // page background
          surface: '#ffffff',  // panel/card surface
          border: '#e2e8f0',   // subtle borders
          rule: '#cbd5e1',     // stronger borders/dividers
          text: '#0f172a',     // primary text (near-black)
          muted: '#64748b',    // secondary/metadata text
          faint: '#94a3b8',    // placeholder/disabled text
          accent: '#3730a3',   // indigo-800, restrained accent
          'accent-mid': '#4f46e5', // indigo-600 for links/buttons
          'accent-bg': '#eef2ff',  // indigo-50 for active bg
          'accent-border': '#c7d2fe', // indigo-200 for active borders
          mono: '#f1f5f9',     // monospace area background (slate-100)
          'mono-text': '#1e293b', // monospace area text (slate-800)
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
