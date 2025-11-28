// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // your existing config...
  // experimental: { ... } etc.

  experimental: {
    // keep any existing experimental options you already have here
    // ...
    allowedDevOrigins: [
      // Localhost (default dev)
      "http://localhost:3000",
      "http://127.0.0.1:3000",

      // Add your external dev origin(s) here:
      // replace PORT with your actual dev port (1455, 3000, etc.)
      "http://138.68.234.156:3000",
      "http://138.68.234.156:1455",
    ],
  },
};

export default nextConfig;
