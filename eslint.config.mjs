import js from "@eslint/js";

export default [
  {
    ignores: ["coverage/**", ".tmp/**", "dist/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },
  },
];
