// ESLint Flat Config for server (migrated from .eslintrc.cjs)
// Docs: https://eslint.org/docs/latest/use/configure/migration-guide
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    // Equivalent envs
    env: {
      node: true,
      es2022: true,
      jest: true
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  }
];
