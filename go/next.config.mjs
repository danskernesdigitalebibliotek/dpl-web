import withPlaiceholder from "@plaiceholder/next"
import path from "path"
import { env } from "process"
import { fileURLToPath } from "url"

// Force singleton instances of packages that hold React/QueryClient context.
// Without this, file:-installed workspace packages (e.g. dpl-service-layer)
// ship their own node_modules and resolve to a second copy at runtime, which
// breaks any React context (QueryClientContext, etc.) shared across the
// boundary. Remove once the monorepo moves to proper workspace links.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const singletonModules = ["react", "react-dom", "@tanstack/react-query"]
// Turbopack expects paths relative to the project root (no leading slash).
const turbopackAliases = Object.fromEntries(
  singletonModules.map(m => [m, `./node_modules/${m}`])
)
// Webpack accepts absolute paths.
const webpackAliases = Object.fromEntries(
  singletonModules.map(m => [m, path.resolve(__dirname, "node_modules", m)])
)

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
  transpilePackages: ["@danskernesdigitalebibliotek/dpl-service-layer"],
  cacheComponents: true,
  typescript: {
    // @todo This is a temporary solution!!
    // We are trying to bring down the build time.
    // Remember to remove this once the build time is optimized!!!
    ignoreBuildErrors: true,
  },
  turbopack: {
    resolveAlias: turbopackAliases,
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
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...webpackAliases,
    }
    return config
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
