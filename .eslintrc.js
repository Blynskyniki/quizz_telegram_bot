module.exports = {
  root: true,
  extends: ['@lad-tech/eslint-config'],
  rules: {
    // Надо бы избавиться от всех any
    '@typescript-eslint/no-explicit-any': 'warn',
    // Надо бы nsc-cli подумать как сделать
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    // Тут бы тоже по хорошему надо бы сделать обертку для dayjs
    '@typescript-eslint/no-restricted-imports': 0,
    // правила ниже скоро перекочуют в @lad-tech/eslint-config
    'sonarjs/no-duplicate-string': ['error', { ignoreStrings: 'lower-case,text/plain,Content-Type' }],
  },
};
