import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier/flat";

export default tseslint.config(
  { ignores: ["build/**"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "prefer-arrow-callback": [
        "error",
        { allowNamedFunctions: false, allowUnboundThis: true },
      ],
      "no-param-reassign": [
        "error",
        { props: true, ignorePropertyModificationsFor: ["state"] },
      ],
      "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
      // We like to use arrow function syntax also for functional components.
      "react/function-component-definition": "off",
    },
  },
  {
    files: ["**/*.tsx"],
    rules: {
      // We do not use prop-types in ts.
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/no-unused-prop-types": "off",
      "no-underscore-dangle": ["error", { allow: ["__typename"] }],
      // We do not create any functionality for our components
      // outside of making them work for storybook viewing.
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "react/button-has-type": "off",
      "jsx-a11y/alt-text": "off",
      "react/no-unstable-nested-components": "off",
      "react/no-array-index-key": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "global-require": "off",
      "@typescript-eslint/no-require-imports": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "react/jsx-props-no-spreading": "off",
      "jsx-a11y/label-has-associated-control": "off",
      // We do not need return types on react components.
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
  {
    files: ["**/*.stories.{jsx,tsx}", "**/*.hoc.tsx"],
    rules: {
      // We need a simple way of passing args in stories via object spreading.
      "react/jsx-props-no-spreading": "off",
    },
  },
  {
    files: ["**/*.entry.tsx"],
    rules: {
      // Since we use High Order Functional Component in entries for text props
      // and want to show the props being used we disable this rule.
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintConfigPrettier,
);
