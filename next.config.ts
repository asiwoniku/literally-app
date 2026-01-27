/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // This skips the Red Errors
  },
  eslint: {
    ignoreDuringBuilds: true, // This skips formatting warnings
  },
};

export default nextConfig;