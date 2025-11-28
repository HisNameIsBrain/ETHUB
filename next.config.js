/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,

  // Safe Image Optimization
  images: {
    // Only allow the domains you explicitly trust
    remotePatterns: [
      { protocol: "https", hostname: "files.edgestore.dev" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  poweredByHeader: false, // remove "X-Powered-By: Next.js"

  reactStrictMode: true,
  swcMinify: true,
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: [
              "accelerometer=()",
              "camera=()",
              "display-capture=()",
              "fullscreen=(self)",
              "geolocation=()",
              "gyroscope=()",
              "microphone=()",
              "payment=()",
              "usb=()"
            ].join(", "),
          },
        ],
      },
    ];
  },

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
