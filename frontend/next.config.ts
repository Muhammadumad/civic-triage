import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/* and /uploads/* to the Render backend in all environments.
  // Set NEXT_PUBLIC_API_URL to your Render backend URL in Vercel env vars.
  // Locally it falls back to http://localhost:5000.
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.BACKEND_URL ||
      'http://localhost:5000'
    ).replace(/\/+$/, '').replace(/\/api$/, '');

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.onrender.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

export default nextConfig;
