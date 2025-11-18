import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co', 'picsum.photos', 'i.pravatar.cc'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;