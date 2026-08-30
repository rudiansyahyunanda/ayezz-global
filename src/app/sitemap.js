import { getDesignTemplates, getCategories } from '../lib/supabaseService';

export default async function sitemap() {
  const baseUrl = 'https://ayezz.com';

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/katalog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const [templates, categories] = await Promise.all([
      getDesignTemplates(),
      getCategories(),
    ]);

    const categoryUrls = Array.isArray(categories)
      ? categories.map((cat) => ({
          url: `${baseUrl}/katalog?cat=${encodeURIComponent(cat.title || '')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
      : [];

    const templateUrls = Array.isArray(templates)
      ? templates.map((tpl) => ({
          url: `${baseUrl}/katalog?id=${encodeURIComponent(tpl.id || '')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        }))
      : [];

    return [...staticPages, ...categoryUrls, ...templateUrls];
  } catch (e) {
    return staticPages;
  }
}
