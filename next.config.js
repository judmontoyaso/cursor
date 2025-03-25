/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  experimental: {
    turbo: false, // Desactiva Turbopack
  },
};

module.exports = nextConfig; 