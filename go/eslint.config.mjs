import { FlatCompat } from "@eslint/eslintrc"
import js from "@eslint/js"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const eslintConfig = [
  {
    ignores: [
      "lib/rest/cover-service-api/generated/",
      "lib/rest/cover-service-api/generated/cover-service.ts",
      "lib/soap/publizon/v2_7/generated/",
      "lib/soap/unilogin/wsiinst-v5/generated/",
      "**/.history/",
    ],
  },
  ...compat.extends(
    "next/core-web-vitals",
    "next/typescript",
    "plugin:storybook/recommended",
    "prettier"
  ),
  {
    rules: {
      "no-console": [
        "error",
        {
          allow: ["warn", "error", "info"],
        },
      ],

      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
]

export default eslintConfig
