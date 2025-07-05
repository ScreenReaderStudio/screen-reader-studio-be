module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['chore', 'docs', 'feat', 'fix', 'refactor', 'remove', 'rename', 'style', 'test'],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
    'header-max-length': [2, 'always', 72],
  },
};
