import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        secondary: "#22c55e",
        accent: "#84cc16",
        surface: "#f0fdf4",
      },
      fontFamily: {
        heading: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        card: "0 20px 50px -20px rgba(22, 101, 52, 0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
