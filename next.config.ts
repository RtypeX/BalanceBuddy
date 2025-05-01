import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.glitch.global',
        port: '',
        pathname: '/baa5928e-6c09-4efd-bb8d-06e0fe6e4aac/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos', // Added picsum.photos hostname
        port: '',
        pathname: '/**', // Allow any path under picsum.photos
      },
    ],
  },
};

export default nextConfig;
