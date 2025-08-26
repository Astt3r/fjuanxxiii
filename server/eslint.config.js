// Unified ESLint Flat Config for server (CommonJS)
// ESLint v9 flat config (no 'env' key; use globals instead)
// Ref: https://eslint.org/docs/latest/use/configure/migration-guide
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
        ...globals.jest,
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  }
];
