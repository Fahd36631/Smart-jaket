/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Tajawal", "Roboto", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          dark: "#004b2c",
          DEFAULT: "#0d6b47",
          light: "#009b6d",
        },
        status: {
          safe: "#009b6d",
          warn: "#f2b90c",
          danger: "#d82727",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f5f6f8",
          card: "#f0f2f4",
        },
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

