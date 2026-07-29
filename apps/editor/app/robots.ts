import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://aruct.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/pricing', '/signup', '/login', '/privacy', '/terms'],
        disallow: [
          '/',
          '/scenes',
          '/scene/',
          '/account',
          '/admin/',
          '/catalog',
          '/items',
          '/plugins',
          '/dcc-bridge',
          '/org/',
          '/api/',
          '/billing/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
