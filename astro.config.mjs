import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

import db from "@astrojs/db";

export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    db(),
  ],
  security: {
    checkOrigin: true,
  },
  output: "server",
  vite: {
    optimizeDeps: {
      exclude: ["astro:db"],
    },
    define: {
      "process.env.ASTRO_STUDIO_APP_TOKEN": JSON.stringify(
        "2cb35d291538f2374269346d7dad53d6a1a0e381:gbait2oe8iuyu0xmu4c73i23os5r:gbait2oe8iuyu0xmu4c73i23os5r"
      ),
    },
  },
  adapter: cloudflare({
    imageService: "cloudflare",
    platformProxy: {
      enabled: true,
    },
  }),
});
