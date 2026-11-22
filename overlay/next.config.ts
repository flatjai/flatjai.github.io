import type { NextConfig } from "next";

// The showcase build: FlatJai's own web app exported as static files for GitHub Pages.
// No server, no API: every action opens the "run it yourself" guide instead.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
