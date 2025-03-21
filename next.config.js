/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'romesite.fr',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
}

module.exports = nextConfig 