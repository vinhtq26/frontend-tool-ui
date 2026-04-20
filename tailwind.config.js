/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#F7FAFC',
        primary: '#4F46E5',
        accent: '#10B981',
        ink: '#0F172A'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 10px 30px -12px rgba(15, 23, 42, 0.18)'
      }
    }
  },
  plugins: []
};
