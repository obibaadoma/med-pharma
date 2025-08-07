module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  root: true,
  rules: {
    'prettier/prettier': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'off', // Add this to disable the warning
    '@typescript-eslint/no-floating-promises': 'off' // Add this to disable the warning
  },
  env: {
    node: true,
    jest: true
  }
}