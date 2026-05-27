import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: ["fbs/src/generated/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error", "info"] }],
      "no-restricted-properties": [
        "error",
        {
          object: "describe",
          property: "only",
          message: "describe.only() leaves a single test running. Remove it.",
        },
        {
          object: "it",
          property: "only",
          message: "it.only() leaves a single test running. Remove it.",
        },
        {
          object: "test",
          property: "only",
          message: "test.only() leaves a single test running. Remove it.",
        },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  }
)
