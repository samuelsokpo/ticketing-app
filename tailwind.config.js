/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0B0D12",
          900: "#12151E",
          850: "#181C28",
          800: "#222736",
        },
        okpo: {
          purple: "#9333EA",
          purpleLight: "#A855F7",
          purpleDark: "#7E22CE",
          purpleDeep: "#6B21A8",
          crimson: "#FF3B30",
          gold: "#E5C07B",
          goldBright: "#FFB300",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        editorial: ["Syne", "Playfair Display", "serif"],
      },
      boxShadow: {
        glow: "0 0 25px rgba(147, 51, 234, 0.30)",
        glowLg: "0 0 50px rgba(147, 51, 234, 0.20)",
        goldGlow: "0 0 25px rgba(229, 192, 123, 0.25)",
      },
    },
  },
  plugins: [],
};
