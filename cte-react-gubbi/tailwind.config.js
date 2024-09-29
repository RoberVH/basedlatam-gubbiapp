/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',  // Asegúrate de que Tailwind busque las clases en los archivos React
    './public/index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],  // Define la fuente "Roboto"
      },
    },
  },
  plugins: [],
}
