import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bucket.ammenu.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  turbopack: {
    root: process.cwd(),
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api/v1",
  },
};

export default nextConfig;
