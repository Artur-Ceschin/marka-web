import type { NextConfig } from "next";
import path from "path";

// Baseline production security headers. Applied to every route.
// Note: a strict Content-Security-Policy is intentionally NOT included here —
// it should be added once we audit every third-party origin the app calls
// (Cognito, CloudFront, Nominatim, Google OAuth, PlantNet). Adding a wrong
// CSP would break sign-in silently in production.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    // We use geolocation on /explore; camera/microphone are not used.
    value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@marka-app/ui", "@marka-app/tokens"],
  poweredByHeader: false,
  sassOptions: {
    includePaths: [path.join(process.cwd(), "src")],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    localPatterns: [
      { pathname: '/images/**' },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "http",
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
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
