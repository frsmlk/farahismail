import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Legacy portfolio UI kept in repo but no longer used by the Book Club site.
    "src/app/HomeClient.tsx",
    "src/components/**",
    "src/lib/useSSE.ts",
    "src/lib/db/queries.ts",
  ]),
]);

export default eslintConfig;
