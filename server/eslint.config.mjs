// server/eslint.config.mjs
import js from "@eslint/js";
import globals from "globals";

export default [
  // ignora outputs
  { ignores: ["dist/**", "build/**", "coverage/**", "node_modules/**"] },

  // base recomendada
  js.configs.recommended,

  // tu configuración para JS del servidor
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      // Si tu código de app usa require/module.exports, deja "commonjs".
      // Si usa import/export y tu package.json tiene "type":"module", usa "module".
      sourceType: "commonjs",
      globals: {
        // reemplaza `env: { node: true }`
        ...globals.node,
        // si tienes archivos que corren en navegador, añade:
        // ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["error", {
        "args": "after-used",
        "ignoreRestSiblings": true,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_",
        "caughtErrors": "all",
        "caughtErrorsIgnorePattern": "^_"
      }]
    }

  },

  // (opcional) tests con Jest
  {
    files: ["**/*.test.js", "**/__tests__/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
