import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind v4 requires @tailwindcss/turbopack to process @theme, @custom-variant etc.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
