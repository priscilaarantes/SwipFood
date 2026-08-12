/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        creme: '#dbcbb8',
        cremeClaro: '#f4eee9',
        escuro: '#1C1C1C',
        vermelho: '#e74c3c',
        vermelhoEscuro: '#c0392b'
      }
    },
  },
  plugins: [],
}
