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
};

export default nextConfig;
