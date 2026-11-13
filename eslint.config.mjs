import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Archived Vite landing page — not part of the Next.js app or its build.
    "legacy-landing/**",
  ]),
  {
    rules: {
      // Closing popovers/menus when the route changes is a valid pattern in this
      // codebase. The rule is kept as a warning so new violations stay visible
      // until those effects are refactored.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
