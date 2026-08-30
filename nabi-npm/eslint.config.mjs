import eslint from '@eslint/js';
import parser from '@typescript-eslint/parser';
import plugin from '@typescript-eslint/eslint-plugin';

export default [
  { ignores: ['dist/**', 'cdn/dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**'] },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,mjs}'],
    languageOptions: { parser },
    plugins: { '@typescript-eslint': plugin },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': 'off',
      'no-control-regex': 'off',
      'no-constant-condition': 'off',
      'no-useless-assignment': 'off',
      'no-useless-escape': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
];
