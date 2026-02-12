import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  //  SVG support via @svgr/webpack when using --webpack flag
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
