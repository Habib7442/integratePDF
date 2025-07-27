import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/private/',
        '/_next/',
        '/admin/',
      ],
    },
    sitemap: 'https://integratepdf.com/sitemap.xml',
  }
}
