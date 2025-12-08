import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [],
    // Allow data URIs for base64 images
    dangerouslyAllowSVG: true,
    unoptimized: false,
  },
  serverExternalPackages: ['@prisma/client', 'prisma'],
  /* config options here */
};

export default nextConfig;
