/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        pageBg: '#FBF8F3',
        cardSurface: '#FFFFFF',
        softBorder: '#E8E3DA',
        primaryTeal: {
          DEFAULT: '#0E5C55',
          hover: '#0A4A44',
        },
        headingInk: '#0B3B38',
        accentTerracotta: {
          DEFAULT: '#C2652B',
          hover: '#A85220',
        },
        bodyText: '#3F4B49',
        mutedText: '#7A8583',
        tealTint: '#E6F1EF',
        terracottaTint: '#F8E9DF',
        statusAmber: '#B7791F',
        statusRed: '#B3261E',
      },
    },
  },
  plugins: [],
};
