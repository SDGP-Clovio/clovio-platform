/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clovio: {
          purple: "#B179DF",
          "purple-light": "#E8D5F5",
          "purple-dark": "#8B4FC8",
          teal: "#85D5C8",
          "teal-light": "#D4F0EC",
          "teal-dark": "#5BBCB0",
          dark: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
};
