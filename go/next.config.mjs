/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverSourceMaps: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
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

export default nextConfig
