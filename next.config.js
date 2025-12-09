/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    manualClientBasePath: true,
  },

  // Prevent Next.js from scanning parent directories (Android restriction)
  watchOptions: {
    ignored: [
      "/data/**",
      "/data/data/**",
      "/storage/**",
      "/proc/**",
      "/sys/**",
      "/system/**",
      "/vendor/**",
      "/dev/**",
      "/mnt/**",
    ],
    followSymlinks: false,
  },
};

export default nextConfig;
