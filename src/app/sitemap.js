export default function sitemap() {
  const baseUrl = 'https://capital.gro10x.com';
  const currentDate = new Date().toISOString();

  const routes = [
    { url: '', priority: 1.0, changeFrequency: 'daily' },
    { url: '/showcase', priority: 0.9, changeFrequency: 'daily' },
    { url: '/secondary-market', priority: 0.8, changeFrequency: 'daily' },
    { url: '/apply', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/apply/status', priority: 0.6, changeFrequency: 'daily' },
    { url: '/financial-model', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/cash-concierge', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/ai-assistant', priority: 0.7, changeFrequency: 'weekly' },
    { url: '/telegram', priority: 0.7, changeFrequency: 'weekly' },
    { url: '/legal-contracts', priority: 0.6, changeFrequency: 'monthly' },
    { url: '/funding-rounds', priority: 0.7, changeFrequency: 'weekly' },
    { url: '/terms', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/privacy', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/risk-disclosure', priority: 0.5, changeFrequency: 'monthly' },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: currentDate,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
