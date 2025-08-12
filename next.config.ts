/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },
  images: { domains: ["images.unsplash.com", "public.blob.vercel-storage.com"] },

  /* OLD → REMOVE
  experimental: { turbo: {} },
  */

  /* NEW → ADD */
  turbopack: {},
};

module.exports = nextConfig;