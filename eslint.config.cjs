const globals = require('globals');
const pluginJs = require('@eslint/js');
const pluginImport = require('eslint-plugin-import');

module.exports = [
  pluginJs.configs.recommended,
  {
    files: ['**/*.js'],
    plugins: {
      import: pluginImport
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.jest
      }
    },
    settings: {
      'import/resolver': {
        node: true
      }
    },
    rules: {
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { 'avoidEscape': true }],
      'indent': ['error', 2],
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      'complexity': ['error', 10],
      'max-depth': ['error', 3],
      'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],

    }
  },
  {
    files: ['**/*.test.js'],
    rules: {
      'max-lines-per-function': 'off',
    }
  },
  {
    ignores: ['node_modules/', 'coverage/']
  }
];
