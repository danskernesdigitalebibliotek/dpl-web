import { Metadata } from "next"

import { getEnv } from "../config/env"

/**
 * Sets metadata for a single page in the Next.js application.
 * @param {string} title - The title of the page. Should not include the site name.
 * @param {string} [description] - Optional description of the page. Used for SEO and social sharing.
 * @returns {Metadata} A Next.js Metadata object containing the page's metadata.
 * @example
 * // Basic usage with just a title
 * setPageMetadata("My Page")
 *
 * // Usage with both title and description
 * setPageMetadata("My Page", "This is a description of my page")
 */
export const setPageMetadata = (title: string, description?: string) => {
  return {
    title,
    description,
  } as Metadata
}

// Used to set default global metadata for the entire site
export const setLayoutMetadata = () => {
  return {
    title: "Børnebiblioteket GO!",
    description:
      "GO! er en digital platform, der giver børn og unge adgang til bøger, lydbøger og e-bøger.",
    icons: [
      { rel: "icon", type: "image/png", url: "/favicon-96x96.png", sizes: "96x96" },
      { rel: "shortcut icon", url: "/favicon.ico" },
      { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
    ],
    manifest: "/site.webmanifest",
    metadataBase,
    openGraph,
  } as Metadata
}

const metadataBase: Metadata["metadataBase"] = new URL("", getEnv("APP_URL"))

const openGraph: Metadata["openGraph"] = {
  type: "website",
  locale: "da_DK",
  siteName: "Børnebiblioteket GO!",
  images: [
    {
      url: "/images/logo-background.jpg",
      alt: "Børnebiblioteket GO!",
    },
  ],
}
