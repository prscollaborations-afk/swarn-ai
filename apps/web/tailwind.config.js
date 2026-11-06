/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ruby: {
          50: '#fdf2f4',
          100: '#fbe6e9',
          500: '#e11d48',
          900: '#881337',
          950: '#4c0519',
        },
        gold: {
          50: '#fbf9f0',
          100: '#f6f1dc',
          400: '#fbbf24',
          500: '#d97706',
          600: '#b45309',
        },
        indigo: {
          900: '#1e1b4b',
          950: '#0f0e26',
        }
      },
      fontFamily: {
        heading: ["'Cormorant Garamond'", "serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      backdropBlur: {
        glass: '22px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)',
        'glass-hover': '0 12px 40px 0 rgba(217, 119, 6, 0.25), inset 0 1px 2px 0 rgba(255, 255, 255, 0.25)',
      }
    },
  },
  plugins: [],
};
