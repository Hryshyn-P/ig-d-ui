import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? process.env.NEXT_PUBLIC_BASE_PATH || "" : "";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.47"],
  output: isGitHubPages ? "export" : undefined,
  trailingSlash: isGitHubPages,
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
  turbopack: { root: process.cwd() },
};

export default nextConfig;
