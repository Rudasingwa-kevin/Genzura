/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#185FA5',
        'brand-dark': '#0C447C',
        'brand-light': '#E6F1FB',
        'brand-green': '#3B6D11',
        'brand-green-light': '#EAF3DE',
        'page-bg': '#F4F6F8',
        'border-base': 'rgba(0,0,0,0.10)',
        'text-primary': '#111111',
        'text-secondary': '#5A5A5A',
        'text-muted': '#9A9A9A',
        'warning-text': '#854F0B',
        'warning-bg': '#FAEEDA',
        'danger-text': '#A32D2D',
        'danger-bg': '#FCEBEB',
        'info-text': '#185FA5',
        'info-bg': '#E6F1FB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
      },
      height: {
        'navbar': '120px',
        'input': '36px',
      },
      width: {
        'sidebar': '220px',
      },
      spacing: {
        'content': '24px',
      },
      transitionDuration: {
        'base': '150ms',
      }
    },
  },
  plugins: [],
}
