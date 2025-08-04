/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
          "files.edgestore.dev"
        ]
      }
}

module.exports = nextConfig
export default {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        search: ''
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        search: ''
      }
    ]
  }
}