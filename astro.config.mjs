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
    // define: {
    //   "process.env.ASTRO_STUDIO_APP_TOKEN": JSON.stringify("PLACEHOLDER"),
    // },
  },
  adapter: cloudflare({
    imageService: "cloudflare",
    platformProxy: {
      enabled: true,
    },
  }),
});
