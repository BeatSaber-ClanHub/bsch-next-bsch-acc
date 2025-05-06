import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "**",
        search: "",
      },
      {
        protocol: "https",
        hostname: process.env.UPLOADTHING_HOSTNAME as string,
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
        pathname: "**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SERVER_URL: "http://localhost:3000",
  },
};

export default nextConfig;
