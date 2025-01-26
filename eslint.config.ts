import pluginJs from '@eslint/js'
import type { FlatConfig } from '@typescript-eslint/utils/ts-eslint'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import pluginTs from 'typescript-eslint'

export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  { ignores: ['src-tauri/', 'dist/'] },
  { languageOptions: { globals: globals.browser } },
  {
    settings: {
      react: { version: 'detect' },
    },
  },
  pluginJs.configs.recommended,
  ...pluginTs.configs.recommended,
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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-expressions': ['warn', { allowShortCircuit: true, allowTernary: true }],
      'react-refresh/only-export-components': 'warn',
      'react-hooks/exhaustive-deps': 0,
      'jsx-a11y/media-has-caption': 'off',
    },
  },
] satisfies FlatConfig.Config[]
