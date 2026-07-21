import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginReact from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import stylistic from "@stylistic/eslint-plugin"

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
      "@stylistic": stylistic,
    },
    languageOptions: { globals: globals.browser },
    rules: {
      ...reactHooks.configs.recommended.rules, // turn on react-hooks rules
      // With JSX Transform in React 17, no longer need to import React into
      // every JSX file. Turn off warnings so it doesn't complain.
      "react/react-in-jsx-scope": "off", // Disable rule that requires React to be in scope
      "react/jsx-uses-react": "off", // Disable rule that checks for React usage in JSX
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "never"],
    },
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
  },
  {
    // Server files need Node.js globals, not browser globals
    files: ["server/**/*.{js,mjs}"],
    languageOptions: { 
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
  },
  {
    // this needs to be outside of the curly braces above, so it acts as "global" ignores
    ignores: ["**/dist", "**/.eslintrc.cjs", "**/public"],
  },
  // Custom rules for src/ui and src/worker, to prevent imports between them
  {
    files: ["src/ui/**"],
    rules: {
      "no-restricted-imports": [ "error",
        {
          patterns: [{
            group: ["../worker/**"],
            message: "'ui' code should not import 'worker' code"
          }]
        }
      ]
    }
  },
  {
    files: ["src/worker/**"],
    rules: {
      "no-restricted-imports": [ "error",
        {
          patterns: [{
            group: ["../ui/**"],
            message: "'worker' code should not import 'ui' code"
          }]
        }
      ]
    }
  },
  // Custom rules for src/common, to prevent imports from src/ui or src/worker
  // However, it is allowed for src/ui and src/worker to import from src/common
  {
    files: ["src/common/**"],
    rules: {
      "no-restricted-imports": [ "error",
        {
          patterns: [{
            group: ["../ui/**", "../worker/**"],
            message: "'common' code should not import 'ui' or 'worker' code"
          }]
        }
      ]
    }
  }
]
