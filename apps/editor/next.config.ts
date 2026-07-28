import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'firebase-admin',
    '@neondatabase/serverless',
    'drizzle-orm',
    'drizzle-orm/neon-http',
    '@aruct/mcp',
    // Subpath exports must also be listed explicitly for workspace packages
    // whose local path bypasses the top-level serverExternalPackages match.
    '@aruct/mcp/storage',
    '@aruct/mcp/operations',
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // `bun:sqlite` is a Bun-only built-in; the sqlite-driver falls back to
      // node:sqlite at runtime so we mark the Bun import as external so webpack
      // doesn't try to bundle it.
      const origExternals = config.externals
      config.externals = [
        ...(Array.isArray(origExternals) ? origExternals : origExternals ? [origExternals] : []),
        ({ request }: { request?: string }, callback: (err?: Error | null, result?: string) => void) => {
          if (request?.startsWith('bun:')) return callback(null, `commonjs ${request}`)
          callback()
        },
      ]
    }
    return config
  },
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
