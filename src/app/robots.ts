import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://www.farahismail.com/sitemap.xml',
    host: 'https://www.farahismail.com',
  };
}
