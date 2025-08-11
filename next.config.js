/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["files.edgestore.dev"]
  },
  experimental: {
    typedRoutes: true
  }
};
module.exports = nextConfig;
