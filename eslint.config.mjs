import eslintPluginAstro from "eslint-plugin-astro";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      globals: {
        // Add browser and Node.js globals needed for API routes
        URL: "readonly",
        Response: "readonly",
        Request: "readonly",
        fetch: "readonly",
        console: "readonly",
        crypto: "readonly"
      }
    },
    rules: {
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      ".astro",
      "src/components/ui/*",
      "functions",
      "src/env.d.ts",
    ],
  },
);
