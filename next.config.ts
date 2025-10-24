import type { NextConfig } from 'next';

/**
 * Next.js 15 Configuration with Turbopack
 *
 * Key settings:
 * - Turbopack: Default bundler (enabled automatically)
 * - transpilePackages: ESM packages that need transpilation
 * - images: Remote image patterns for Supabase and OAuth providers
 * - serverActions: Configuration for Server Actions
 */
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
  // ESM packages that require transpilation for compatibility
  transpilePackages: ['yjs', 'lib0'],
};

export default nextConfig;
