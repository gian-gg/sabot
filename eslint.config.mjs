import nextConfig from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'next.config.ts',
    ],
  },
  ...nextConfig,
];

export default eslintConfig;
