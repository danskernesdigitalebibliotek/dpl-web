import withPlaiceholder from "@plaiceholder/next"
import { env } from "process"

function dynamicAllowedHostnames() {
  const allowed = []

  // While testing, we allow all host names to avoid errors while using mocked responses.
  if (env.NODE_ENV !== "production") {
    allowed.push({
      protocol: "https",
      hostname: "**",
      pathname: "/**",
    })
  } else if (env.DPL_CMS_BASE_URL) {
    // Allow images which originate from set DPL CMS hostname
    // Strip protocol from url, as remotePatterns only supports hostnames
    allowed.push({
      protocol: "https",
      hostname: env.DPL_CMS_BASE_URL.replace(/^https?:\/\//, ""),
      pathname: "/**",
    })
  }

  return allowed
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
    unoptimized: env.NODE_ENV !== "production",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
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
      ...dynamicAllowedHostnames(),
    ],
  },
}

export default withPlaiceholder(nextConfig)
