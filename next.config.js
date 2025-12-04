/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "files.edgestore.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // add more hostnames here if needed
    ],
  },
};

module.exports = nextConfig;
