import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, {
  ignores: ['dist/**', 'node_modules/**'],
}, {
  files: ['**/*.ts', '**/*.tsx'],
  rules: { '@typescript-eslint/no-explicit-any': 'error' },
}, {
  files: ['**/*.mjs'],
  languageOptions: { globals: { URL: 'readonly' } },
});
