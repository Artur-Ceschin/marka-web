import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@marka-app/ui", "@marka-app/tokens"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "my-api.plantnet.org",
      },
    ],
  },
};

export default nextConfig;
