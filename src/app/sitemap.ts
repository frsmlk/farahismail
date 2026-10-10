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
      url: 'https://www.farahismail.com/bookindex',
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...['about', 'play', 'mood'].map(path => ({url: `https://www.farahismail.com/${path}`, lastModified: now})),
  ];
}
