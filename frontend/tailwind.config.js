/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clovio: {
          purple: "#4F46E5",
          "purple-light": "#EEF2FF",
          "purple-dark": "#4338CA",
          teal: "#10B981",
          "teal-light": "#ECFDF5",
          "teal-dark": "#059669",
          dark: "#0F172A",
        },
      },
    },
  },
  plugins: [],
};
