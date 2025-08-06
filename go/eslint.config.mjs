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
    "prettier",
    "plugin:storybook/recommended",
    "plugin:cypress/recommended",
    "plugin:import/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:jsx-a11y/recommended"
  ),
  {
    rules: {
      "no-console": [
        "error",
        {
          //TODO: this allow list should be removed before going live
          allow: ["warn", "error", "info"],
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Do not use process.env directly. Use getEnv() or getServerEnv() from env.ts instead.",
        },
      ],
      "no-restricted-properties": [
        "warn",
        {
          object: "cy",
          property: "setViewport",
          message:
            "Beware that setViewport should only be used while debugging Cypress locally. Otherwise it forces the viewport to a fixed size, which is not what we want for responsive testing.",
        },
        {
          object: "describe",
          property: "only",
          message:
            "describe.only() should not be used in production code. Remove .only() to run all tests.",
        },
        {
          object: "it",
          property: "only",
          message:
            "it.only() should not be used in production code. Remove .only() to run all tests.",
        },
        {
          object: "test",
          property: "only",
          message:
            "test.only() should not be used in production code. Remove .only() to run all tests.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            'JSXAttribute[name.name="data-cy"]:not([value.expression.object.name="cyKeys"])',
          message: "data-cy attribute must use cyKeys object (e.g., data-cy={cyKeys['key']})",
        },
      ],

      "no-alert": "error",
      "no-script-url": "error",
      "prefer-arrow-callback": [
        "error",
        {
          allowNamedFunctions: false,
          allowUnboundThis: true,
        },
      ],

      "react/function-component-definition": "off",
      "react/no-danger": "error",

      "@typescript-eslint/comma-dangle": "off",
      "@typescript-eslint/lines-between-class-members": "off",
      "@typescript-eslint/no-throw-literal": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "cypress/unsafe-to-chain-command": "off",

      "react-hooks/exhaustive-deps": ["warn"],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],

    rules: {
      "react/jsx-no-bind": "off",
      "react/function-component-definition": "off",
      "react/forbid-prop-types": "off",
      "react/destructuring-assignment": "off",
      "@typescript-eslint/return-await": "off",
      "no-param-reassign": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    files: ["**/*.tsx", "**/*.ts"],

    rules: {
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/no-unused-prop-types": "off",
      "react/display-name": "off",

      "no-underscore-dangle": [
        "error",
        {
          allow: ["__typename"],
        },
      ],

      "react/forbid-elements": [
        1,
        {
          forbid: [
            {
              element: "main",
              message:
                "dpl-cms provide a <main> to render react in, therefore you must use <section> to avoid duplicate main",
            },
          ],
        },
      ],
    },
  },
]

export default eslintConfig
