module.exports = {
  extends: 'airbnb-base',
  globals: {
    chrome: true,
    document: true,
    window: true,
    SHORTCUTS: true,
    HubnavStorage: true
  },
  rules: {
    semi: ['error', 'never'],
    'arrow-parens': ['error', 'as-needed'],
    'padded-blocks': 0,
    'no-plusplus': 0,
    'no-param-reassign': 0,
    indent: ['error', 2, { SwitchCase: 1, CallExpression: { arguments: 'off' } }],
    'function-paren-newline': ['error', 'consistent'],
    'class-methods-use-this': 0,
    'no-restricted-syntax': 0,
    'guard-for-in': 0,
    'dot-location': ['error', 'object'],
    'no-mixed-operators': 0,
    'no-bitwise': 0,
    'no-continue': 0,
    'prefer-destructuring': ['error', { object: true, array: false }]
  }
};
