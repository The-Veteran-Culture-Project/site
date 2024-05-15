import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["Titillium Web", "system-ui", "sans-serif"],
      display: ["Open Sans", "system-ui", "sans-serif"],
      static: ["Bebas Neue", "system-ui", "sans-serif"],
    },
    extend: {},
  },
  plugins: [typography()],
};
