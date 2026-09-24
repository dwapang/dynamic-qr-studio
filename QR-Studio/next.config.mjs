/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['node:sqlite'],
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
