/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  images: {
    domains: [
      'lh3.googleusercontent.com', // Add this line for Google OAuth images
      'example.com', // Add other domains as needed
      'yourdomainname.com'
    ]
  },
};

export default nextConfig;
