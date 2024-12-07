/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui", "@repo/prisma-db", "@repo/store", "@repo/chess"],
  images: {
    domains: [
      'lh3.googleusercontent.com', // Add this line for Google OAuth images
      'example.com', // Add other domains as needed
      'yourdomainname.com'
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
