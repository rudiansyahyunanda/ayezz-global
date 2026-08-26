/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'dxrncbevjnfasvkcqhbj.supabase.co',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/new.html',
        destination: '/katalog',
      },
      {
        source: '/new',
        destination: '/katalog',
      },
      {
        source: '/katalog.html',
        destination: '/katalog',
      },
    ];
  },
};

export default nextConfig;
