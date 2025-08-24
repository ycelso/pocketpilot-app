import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removemos output: 'export' para que funcione con Vercel
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
