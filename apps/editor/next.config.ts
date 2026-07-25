import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'firebase-admin',
    '@neondatabase/serverless',
    'drizzle-orm',
    'drizzle-orm/neon-http',
    '@aruct/mcp',
  ],
  logging: {
    browserToTerminal: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    'three',
    '@aruct/viewer',
    '@aruct/core',
    '@aruct/editor',
    '@aruct/plugin-trees',
    '@pascal-app/core',
    '@pascal-app/editor',
    '@pascal-app/lingo',
    '@pascal-app/plugin-trees',
    '@pascal-app/viewer',
    '@dgreenheck/ez-tree',
  ],
  turbopack: {
    resolveAlias: {
      react: './node_modules/react',
      three: './node_modules/three',
      '@react-three/fiber': './node_modules/@react-three/fiber',
      '@react-three/drei': './node_modules/@react-three/drei',
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    unoptimized: process.env.NEXT_PUBLIC_ASSETS_CDN_URL?.startsWith('http://localhost') ?? false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
}

export default nextConfig
