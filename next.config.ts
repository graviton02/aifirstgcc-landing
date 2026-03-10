import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore old Vite-era files during migration.
    // Remove once all legacy files are deleted or migrated.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.convex.cloud" },
    ],
  },
};

export default nextConfig;
