import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "7d3bffb8f9d8c378e5ab1c8c85e90f9e.r2.cloudflarestorage.com",
      },
    ],
  },
};

export default nextConfig;
