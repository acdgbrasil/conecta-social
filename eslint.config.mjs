import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['legacy/**', 'packages/legacy/**', 'dist/**', 'coverage/**', 'node_modules/**']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['legacy/**', 'packages/legacy/**', 'dist/**', 'coverage/**', 'node_modules/**'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd()
      }
    },
    rules: {}
  }
);
