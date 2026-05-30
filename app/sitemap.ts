import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://redzonecouple.site',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://redzonecouple.site/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://redzonecouple.site/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://redzonecouple.site/blog/relationship-problems-disappear-cycle-tracking',
      lastModified: new Date('2026-05-30'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/boyfriends-guide-her-cycle-clueless-to-connected',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/best-couple-apps-for-relationships',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/complete-guide-period-tracking-for-couples',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/cycle-syncing-for-couples',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/how-to-support-girlfriend-during-period',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/menstrual-cycle-awareness-for-men',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/period-tracker-app-transform-your-relationship',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/what-happens-when-couples-track-her-cycle',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/why-couples-who-track-together-stay-together',
      lastModified: new Date('2026-05-19'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/period-tracker-for-boyfriends',
      lastModified: new Date('2026-03-28'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/how-to-support-partner-during-pms',
      lastModified: new Date('2026-03-25'),
      priority: 0.7,
    },
    {
      url: 'https://redzonecouple.site/blog/cycle-tracking-for-couples',
      lastModified: new Date('2026-03-22'),
      priority: 0.7,
    },
  ];
}
