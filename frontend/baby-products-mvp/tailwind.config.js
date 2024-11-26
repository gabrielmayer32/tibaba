const colors = require('tailwindcss/colors');

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Adjust the paths based on your project structure
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          pink: '#FFC1CC',
          mint: '#C8E6C9',
          yellow: '#FFF9C4',
        },
        secondary: {
          blue: '#BBDEFB',
          lavender: '#E1BEE7',
          grey: '#E0E0E0',
        },
        accent: {
          coral: '#FF7043',
          deepBlue: '#283593',
        },
        background: {
          light: '#F5F5F5',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        header: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Dancing Script', 'cursive'], // Optional
      },
      borderRadius: {
        xl: '8px',
      },
      boxShadow: {
        soft: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
