import { MetadataRoute } from 'next';
import { getPerformances, getArtists, getVenues } from '@/lib/microcms';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://osakafringe.com';

  const [performances, artists, venues] = await Promise.all([
    getPerformances(),
    getArtists(),
    getVenues(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/audience`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artists`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/venues`,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/donate`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/logo_download`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const performanceRoutes: MetadataRoute.Sitemap = performances.map((p) => ({
    url: `${baseUrl}/performances/${p.id}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const artistRoutes: MetadataRoute.Sitemap = artists.map((a) => ({
    url: `${baseUrl}/artists/${a.id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const venueRoutes: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${baseUrl}/venues/${v.id}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...performanceRoutes, ...artistRoutes, ...venueRoutes];
}
