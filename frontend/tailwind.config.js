/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        begeGlobal: '#EAE2D6',
        pessegoHeader: '#e4b693',
        pessegoDropdown: '#e8c9b2',
        begeInput: '#F5EBE1',
        amareloCategoria: '#fcf3c5',
        azulMarinho: '#0A1128',
        escuro: '#131b2f',
        vermelho: '#FF595E',
        tagRosa: '#F9D3DC',
        tagVerde: '#CBE8D2',
        tagAzul: '#C9DBF2',
        tagLaranja: '#FBD8B2',
        tagAmarelo: '#FBE9A8',
        tagRoxo: '#D9CFF0',
      }
    },
  },
  plugins: [],
}
