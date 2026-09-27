import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.1.54',
    'localhost:9000',
    '127.0.0.1:9000',
    '192.168.1.54:9000',
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.1.54:3000'
  ],
};

export default nextConfig;
