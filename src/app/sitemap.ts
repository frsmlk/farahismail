import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: 'https://www.farahismail.com/',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.farahismail.com/book-club',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
