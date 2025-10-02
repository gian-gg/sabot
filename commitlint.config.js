// commitlint.config.cjs
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
  },
  helpUrl: `
    Commit message format: <type>(optional scope): <subject>

    Allowed types:
    - feat: a new feature
    - fix: a bug fix
    - docs: documentation changes
    - style: formatting, missing semi colons, etc. (no code change)
    - refactor: code changes that neither fix a bug nor add a feature
    - perf: performance improvements
    - test: adding or correcting tests
    - chore: changes to build process, tools, or dependencies
`,
};
