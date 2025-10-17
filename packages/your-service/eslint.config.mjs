import tseslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import unicorn from 'eslint-plugin-unicorn';
import promise from 'eslint-plugin-promise';
import security from 'eslint-plugin-security';
import functional from 'eslint-plugin-functional';
import boundaries from 'eslint-plugin-boundaries';
import sonarjs from 'eslint-plugin-sonarjs';

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      'import-x': importX,
      unicorn,
      promise,
      security,
      functional,
      boundaries,
      sonarjs,
    },
    settings: {
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/domain/**' },
        { type: 'application', pattern: 'src/application/**' },
        { type: 'infra', pattern: 'src/infra/**' },
        { type: 'presenter', pattern: 'src/presenter/**' },
      ],
    },
    rules: {
      'functional/immutable-data': ['error', { ignoreClasses: false }],
      'functional/no-let': 'error',
      'sonarjs/no-all-duplicated-branches': 'warn',
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
      'promise/no-multiple-resolved': 'error',
      'import-x/no-duplicates': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'boundaries/no-unknown': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: ['domain'], allow: ['domain'] },
            { from: ['application'], allow: ['domain', 'application'] },
            { from: ['infra'], allow: ['infra', 'domain', 'application'] },
            { from: ['presenter'], allow: ['presenter', 'application'] },
          ],
        },
      ],
    },
  },
);
