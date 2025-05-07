import withPlaiceholder from "@plaiceholder/next"
import { env } from "process"

function getImageHostname() {
  if (env.NODE_ENV === "test") {
    return "**"
  }
  return env.NEXT_PUBLIC_DPL_CMS_HOSTNAME?.replace(/^https?:\/\//, "") || ""
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // @todo This is a temporary solution!!
    // We are trying to bring down the build time.
    // Remember to remove this once the build time is optimized!!!
    ignoreBuildErrors: true,
  },
  eslint: {
    // @todo This is a temporary solution!!
    // We are trying to bring down the build time.
    // Remember to remove this once the build time is optimized!!!
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: getImageHostname(),
        pathname: "/**",
      },
    ],
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        options.defaultLoaders.babel,
        {
          loader: "@svgr/webpack",
          options: { babel: false },
        },
      ],
    })
    return config
  },
}

export default withPlaiceholder(nextConfig)
