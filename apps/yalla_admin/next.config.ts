import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
