/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',  // Busca clases en las páginas de Next.js
    './components/**/*.{js,jsx,ts,tsx}',  // Busca clases en los componentes
    './public/**/*.html',  // Busca clases en los archivos HTML dentro de /public (si los tienes)
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
