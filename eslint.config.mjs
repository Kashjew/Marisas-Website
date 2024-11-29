import globals from "globals";
import js from "@eslint/js";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  // Configuration for ES Modules
  {
    files: ["**/*.mjs", "**/modules/*.js"], // Target .mjs files and files in /modules
    languageOptions: {
      sourceType: "module", // Enables import/export
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-unused-vars": ["warn", { "args": "after-used", "ignoreRestSiblings": true }],
    },
    plugins: {
      js,
    },
  },
  // Configuration for CommonJS
  {
    files: ["**/*.js"], // Target .js files (excluding ES Modules in /modules)
    languageOptions: {
      sourceType: "commonjs", // Enables require/module.exports
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "no-unused-vars": ["warn", { "args": "after-used", "ignoreRestSiblings": true }],
    },
    plugins: {
      js,
    },
  },
];
