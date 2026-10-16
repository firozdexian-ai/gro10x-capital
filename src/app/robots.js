export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/kam-dashboard',
          '/promoter',
          '/pos-sync',
          '/fraud-detection',
          '/track/',
        ],
      },
    ],
    sitemap: 'https://capital.gro10x.com/sitemap.xml',
  };
}
