/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workspace: {
          DEFAULT: 'var(--bg-workspace)',
          surface: 'var(--bg-surface)',
          soft: 'var(--bg-soft)',
          elevated: 'var(--bg-elevated)',
          foreground: 'var(--text-foreground)',
          muted: 'var(--text-muted)',
          outline: 'var(--border-outline)',
          'outline-strong': 'var(--border-outline-strong)',
          // GitHub dark palette tokens
          'dark-bg': '#0d1117',
          'dark-surface': '#21262d',
          'dark-soft': '#21262d',
          'dark-elevated': '#161b22',
          'dark-foreground': '#e6edf3',
          'dark-muted': '#7d8590',
          'dark-outline': '#30363d',
        },
        primary: {
          DEFAULT: '#fe6e00',
          strong: '#ff6b00',
          warm: '#ffb74d',
          focus: '#f97015',
        },
        shell: {
          bg: 'rgba(13, 17, 23, 0.85)',
          border: 'rgba(240, 246, 252, 0.12)',
          text: '#f0f6fc',
          'text-muted': '#7d8590',
        },
        status: {
          success: '#00c758',
          warning: '#edb200',
          danger: '#fb2c36',
          info: '#3080ff',
          'mock-bg': '#fef9c2',
          'mock-fg': '#874b00',
          'planned-bg': '#f3f4f6',
          'planned-fg': '#364153',
          'dev-bg': '#dbeafe',
          'dev-fg': '#1447e6',
          'integrated-bg': '#f3e8ff',
          'integrated-fg': '#8200da',
          'prod-bg': '#dcfce7',
          'prod-fg': '#016630',
        }
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06)',
        raised: '0 4px 12px rgba(0, 0, 0, 0.12)',
        dialog: '0 20px 25px rgba(0, 0, 0, 0.10), 0 8px 10px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        pill: '9999px',
      }
    },
  },
  plugins: [],
};
