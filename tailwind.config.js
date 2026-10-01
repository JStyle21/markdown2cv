/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cvHeading: '#1F4E79',
        cvDivider: '#A9A9A9',
        cvLink: '#0000FF',
        cvText: '#000000',
      },
      fontFamily: {
        calibri: ['Calibri', 'Carlito', 'Candara', 'Segoe', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      screens: {
        print: { raw: 'print' },
      },
    },
  },
  plugins: [],
};
