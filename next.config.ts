import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["openai"],
  },
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  },
};

export default nextConfig;
