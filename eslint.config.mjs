import pluginJs from '@eslint/js'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import pluginTs from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { ignores: ['src-tauri/'] },
  { languageOptions: { globals: globals.browser } },
  {
    settings: {
      react: { version: 'detect' },
    },
  },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat['jsx-runtime'],
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
  pluginReactRefresh.configs.recommended,
  pluginJsxA11y.flatConfigs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'react-refresh/only-export-components': 'warn',
      'react-hooks/exhaustive-deps': 0,
    },
  },
]
