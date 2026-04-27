import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@marka-app/ui", "@marka-app/tokens"],
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src")],
  },
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
