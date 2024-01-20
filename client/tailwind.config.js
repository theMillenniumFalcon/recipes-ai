/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
      'blue-1': '#171A29',
      'blue-2': '#2B7CD3'
    },
    fontFamily: {
      'poppins': 'Poppins',
    },
    boxShadow: {
      'shadow-1': '0px 0px 15px rgba(0, 0, 0, 0.12)',
      'shadow-2': '0px 0px 10px rgba(0, 0, 0, 0.12)',
    }
  },
  },
  plugins: [require("@tailwindcss/forms")],
}
