import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import stylisticJs from '@stylistic/eslint-plugin-js';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,jsx}"]},
  {
    plugins: {
      '@stylistic/js': stylisticJs
    },
    rules: {
      "indent": ["warn", 2],
      "semi": ["warn", "always"],
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    }
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];