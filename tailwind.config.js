/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        icoded: {
          navy: '#0B132B',
          dark: '#1C2541',
          slate: '#3A506B',
          blue: '#2563EB',
          cyan: '#00D2FF',
          accent: '#38BDF8',
          card: '#0F172A',
          border: '#1E293B',
          hover: '#1E293B',
          lightBg: '#F8FAFC',
          lightCard: '#FFFFFF',
          lightBorder: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.35)',
        'glow-cyan': '0 0 20px -3px rgba(0, 210, 255, 0.35)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
