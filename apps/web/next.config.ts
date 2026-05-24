import type { NextConfig } from "next";

const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ??
  "https://dsqeedu5n5.execute-api.ap-south-1.amazonaws.com/prod"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Same-origin proxy for `next dev` — avoids CORS while API Gateway CORS is off.
    // Not used for static export on S3; enable CORS for production browser calls.
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${API_BASE}/:path*`,
      },
    ];
  },
};

export default nextConfig;
