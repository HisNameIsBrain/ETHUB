/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "files.edgestore.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // add more hostnames here if needed
    ],
  },
  eslint: {
    // Allow production builds to complete even if lint errors exist.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during production builds.
    ignoreBuildErrors: true,
  },
  env: {
    EDGE_STORE_ACCESS_KEY: process.env.EDGE_STORE_ACCESS_KEY || "dummy",
    EDGE_STORE_SECRET_KEY: process.env.EDGE_STORE_SECRET_KEY || "dummy",
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || "https://dummy.convex.cloud",
    CLERK_PUBLISHABLE_KEY:
      process.env.CLERK_PUBLISHABLE_KEY ||
      "pk_test_bmFjb2RlbGlicmFyeS5jb20ja2V5JA", 
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      process.env.CLERK_PUBLISHABLE_KEY ||
      "pk_test_bmFjb2RlbGlicmFyeS5jb20ja2V5JA",
  },
};

module.exports = nextConfig;
