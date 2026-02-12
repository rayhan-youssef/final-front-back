/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Joya-style palette
        teal: {
          deep: '#0a3d46',
          soft: '#0d5757',
          muted: '#83928c',
          light: '#e7f5f4',
          wash: '#0a3d460d',
        },
        orange: {
          solar: '#f3a31c',
          wash: '#f3a31c1a',
          gradient: 'linear-gradient(90deg, #f29917 0%, #f6b83f 100%)',
        },
        page: {
          bg: '#ffffff',
          section: '#0a3d4605',
        },
      },
      boxShadow: {
        card: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
};
