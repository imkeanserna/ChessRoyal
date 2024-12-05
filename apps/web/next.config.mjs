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
};

export default nextConfig;
