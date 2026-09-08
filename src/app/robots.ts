import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isProtected = process.env.TEST_SITE_PROTECTION_ENABLED === 'true';

  if (isProtected) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/svgmapgenerator', '/donate/success', '/password'],
    },
    sitemap: 'https://osakafringe.com/sitemap.xml',
  };
}
