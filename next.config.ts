import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Ana dizindeki başka bir package-lock.json'un karışmasını engeller
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
