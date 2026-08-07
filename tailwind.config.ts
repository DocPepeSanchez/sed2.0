import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        berry: {
          DEFAULT: "#970E48",
          dark: "#760A38",
          light: "#B43B6C",
        },
        gold: {
          DEFAULT: "#C2995C",
          dark: "#A87E42",
          light: "#D6B585",
        },
        offwhite: "#EFEDEA",
        crema: "#E2DED7",
        ink: "#2B2B2B",
      },
      fontFamily: {
        sans: ["Calibri", "Lato", "Segoe UI", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
