import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    files: ["src/services/analysisService.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        axe: "readonly",
      },
    },
  },
];
