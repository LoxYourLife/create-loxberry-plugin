module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2021
  },
  env: {
    browser: true,
    node: true,
    jest: true
  },
  globals: {
    page: true,
    browser: true,
    context: true,
    jestPuppeteer: true
  },
  extends: ['eslint:recommended'],
  rules: {
    // these rules are disabled since they clash with the prettier configuration
    'vue/no-multiple-template-root': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/html-self-closing': 'off'
  }
};
