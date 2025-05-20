import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lemmesipcafe.netlify.app';

  // Define your site's pages
  const staticPages = [
    '/',
    '/menu',
    '/preorder',
    '/contact',
    '/faq',
    '/gallery', 
    '/image-viewer',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    changeFrequency: 'monthly',
    priority: path === '/' ? 1 : 0.8,
  }));

  return sitemapEntries;
} 