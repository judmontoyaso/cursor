/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    serverActions: {
      enabled: true
    }
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig; 