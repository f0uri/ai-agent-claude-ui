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
        claude: {
          bg: '#1a1a1a',
          surface: '#262626',
          surface2: '#2f2f2f',
          border: '#3d3d3d',
          text: '#ececec',
          textMuted: '#a0a0a0',
          accent: '#d97757',
          accentHover: '#c4674f',
          user: '#2f2f2f',
          assistant: '#262626',
        },
        light: {
          bg: '#f9f9f9',
          surface: '#ffffff',
          surface2: '#f0f0f0',
          border: '#e0e0e0',
          text: '#1a1a1a',
          textMuted: '#666666',
          accent: '#d97757',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'typing': 'typing 1.4s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
