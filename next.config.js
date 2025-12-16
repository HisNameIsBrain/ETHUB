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
              "usb=()",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
