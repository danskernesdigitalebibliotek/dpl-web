import { builtinRules } from 'eslint/use-at-your-own-risk';
import drupalContrib from 'eslint-plugin-drupal-contrib';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

// eslint-plugin-drupal-contrib does not have a release compatible with ESLint 9
// yet, so we need to monkey-patch it, removing any references it has to
// built-in rules that ESLint 9 removed (e.g. `valid-jsdoc`, `require-jsdoc` and
// several long-deprecated `space-*` rules).
const dropRemovedCoreRules = (config) => {
  if (!config.rules) {
    return config;
  }
  const rules = Object.fromEntries(
    Object.entries(config.rules).filter(
      ([name]) => name.includes('/') || builtinRules.has(name),
    ),
  );
  return { ...config, rules };
};

const drupalContribPassing = drupalContrib.configs['flat/passing']
  .flat(Infinity)
  .map(dropRemovedCoreRules);

export default [
  {
    ignores: [
      '**/web/core/**',
      '**/web/libraries/**',
      '**/web/modules/contrib/**',
      '**/web/sites/**/files/**',
      // Scaffolded verbatim from drupal/core. Reformatting them to satisfy
      // Prettier only lasts until the next `composer drupal:scaffold`.
      '**/web/sites/default/default.services.yml',
      '**/web/sites/development.services.yml',
      '**/web/themes/custom/novel/assets/**',
      '**/web/themes/contrib/**',
      '**/web/modules/local/**',
      '**/web/modules/custom/bnf/bnf_example_content/content/**',
      '**/web/modules/custom/dpl_example_content/content/**',
      '**/web/modules/custom/dpl_static_content/content/**',
      '**/web/modules/custom/dpl_static_content/modules/dpl_static_content_20260528_audiences/content/**',
    ],
  },
  ...drupalContribPassing,
  prettierRecommended,
  {
    rules: {
      'no-console': ['error', { allow: ['debug', 'warn', 'error'] }],
    },
  },
];
