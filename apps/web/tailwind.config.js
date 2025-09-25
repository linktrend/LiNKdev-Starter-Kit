const preset = require("../../packages/config/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [preset],
  content: [
    "./src/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./dist/*.{html,js}",
    "./node_modules/fumadocs-ui/dist/**/*.js"
  ],
  future: { hoverOnlyWhenSupported: true },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
};
