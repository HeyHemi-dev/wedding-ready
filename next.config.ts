import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [768, 1024, 1280, 1920],
    imageSizes: [300, 500],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jjoptcpwkl.ufs.sh',
        pathname: '/f/*',
      },
    ],
  },
  /* config options here */
}

export default nextConfig
