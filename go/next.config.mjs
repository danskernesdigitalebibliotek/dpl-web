import withPlaiceholder from "@plaiceholder/next"
import { env } from "process"

function getAllowedHostname() {
  // While testing we allow all hostnames, to avoid errors while using mocked responses
  if (env.NODE_ENV !== "production") {
    return "**"
  }

  // Allow images which originate from set DPL CMS hostname
  // Strip protocol from url, as remotePatterns only supports hostnames
  return env.NEXT_PUBLIC_DPL_CMS_HOSTNAME?.replace(/^https?:\/\//, "") || ""
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  typescript: {
    // @todo This is a temporary solution!!
    // We are trying to bring down the build time.
    // Remember to remove this once the build time is optimized!!!
    ignoreBuildErrors: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              babel: false,
            },
          },
        ],
        as: "*.js",
      },
    },
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
        hostname: getAllowedHostname(),
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "fbiinfo-present.dbc.dk",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "default-forsider.dbc.dk",
        pathname: "/**",
      },
    ],
  },
}

export default withPlaiceholder(nextConfig)
