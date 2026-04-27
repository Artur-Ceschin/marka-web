import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@marka-app/ui", "@marka-app/tokens"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "my-api.plantnet.org",
      },
      {
        protocol: "https",
        hostname: "bs.plantnet.org",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
