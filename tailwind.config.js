/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        workspace: {
          DEFAULT: '#fcfaf7',
          surface: '#f3f4f6',
          soft: '#edebe9',
          elevated: '#ffffff',
          foreground: '#423d38',
          muted: '#797067',
          outline: '#e3e0dd',
          'outline-strong': '#d1d5dc',
        },
        primary: {
          DEFAULT: '#fe6e00',
          strong: '#ff6b00',
          warm: '#ffb74d',
          focus: '#f97015',
        },
        shell: {
          bg: 'rgba(0, 0, 0, 0.70)',
          border: 'rgba(255, 255, 255, 0.10)',
          text: '#ffffff',
          'text-muted': 'rgba(255, 255, 255, 0.65)',
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

