/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
  // Preserve SEO equity from the old WordPress URLs (§16.3 of the developer docs)
  async redirects() {
    return [
      { source: '/products-made-by-ugandas-fabricators', destination: '/products', permanent: true },
      { source: '/aluminium-doors-and-windows', destination: '/products/aluminium-doors-and-windows', permanent: true },
      { source: '/ceiling-2', destination: '/products/ceiling', permanent: true },
      { source: '/curtain-wall-2', destination: '/products/curtain-wall', permanent: true },
      { source: '/facade-2', destination: '/products/facade', permanent: true },
      { source: '/partitions', destination: '/products/partitions', permanent: true },
      { source: '/glass-products-2', destination: '/products/glass-products', permanent: true },
      { source: '/interior-design', destination: '/products/interior-design', permanent: true },
      { source: '/railings', destination: '/products/railings', permanent: true },
      { source: '/steel-products', destination: '/products/steel-products', permanent: true },
      { source: '/projects-done-by-casements-in-uganda', destination: '/projects', permanent: true },
    ];
  },
};

export default nextConfig;
