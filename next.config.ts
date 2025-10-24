import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tccufwrlcccsrbzxmkto.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  transpilePackages: ['yjs', 'lib0'],
  webpack: (config) => {
    // Handle lib0 submodule imports (lib0/observable, lib0/random, etc.)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'lib0/observable': require.resolve('lib0/observable'),
      'lib0/error': require.resolve('lib0/error'),
      'lib0/random': require.resolve('lib0/random'),
    };
    return config;
  },
};

export default nextConfig;
