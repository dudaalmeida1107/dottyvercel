/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dottyPink: "#fa80ac",
        dottyMustard: "#ab6b17",
        dottyBlue: "#bee5e8"
      },
      borderRadius: { 'xl2': '1.25rem' }
    },
  },
  plugins: [],
};
