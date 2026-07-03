import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import cypressPlugin from 'eslint-plugin-cypress';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

// Flat-config replacement for the previous cypress/.eslintrc.json. The order
// mirrors the old `extends` array: base JS rules, then typescript-eslint
// (which also registers the TS parser and turns off conflicting core rules for
// .ts files), then the Cypress plugin (globals + Cypress-specific rules), and
// finally Prettier so formatting rules win.
export default [
  js.configs.recommended,
  ...tsPlugin.configs['flat/recommended'],
  cypressPlugin.configs.recommended,
  prettierRecommended,
];
