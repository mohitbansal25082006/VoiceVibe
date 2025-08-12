import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Turbopack is enabled by CLI flag --turbopack */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
