import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Enables smaller deployable unit
  reactStrictMode: true,
  swcMinify: true, // Enables SWC-based minification
  compress: true, // Enables compression
};

export default nextConfig;
