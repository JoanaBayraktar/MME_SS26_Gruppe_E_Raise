/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#D6336C",
          light: "#FCE7F1",
        },
      },
    },
  },
  plugins: [],
};
