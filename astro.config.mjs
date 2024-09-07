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
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
    routes: {
      extend: {
        include: [{ pattern: "/pages/*" }],
      },
    },
  }),
});
