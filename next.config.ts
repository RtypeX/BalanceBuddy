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
    ],
  },
};

export default nextConfig;
