import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import stylisticJs from "@stylistic/eslint-plugin-js"

/** @type {import('eslint').Linter.Config[]} */
export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"], // Add this if you are using React 17+
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "@stylistic/js": stylisticJs,
    },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules, // turn on react-hooks rules
      // With JSX Transform in React 17, no longer need to import React into
      // every JSX file. Turn off warnings so it doesn't complain.
      "react/react-in-jsx-scope": "off", // Disable rule that requires React to be in scope
      "react/jsx-uses-react": "off", // Disable rule that checks for React usage in JSX
      "@stylistic/js/quotes": ["error", "double"],
      "@stylistic/js/semi": ["error", "never"],
    },
  },
  {
    // this needs to be outside of the curly braces above, so it acts as "global" ignores
    ignores: ["**/dist", "**/.eslintrc.cjs", "**/public"],
  },
]
