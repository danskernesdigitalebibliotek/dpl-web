import { TAssetType } from "@/lib/helpers/helper.scripts"

export const readerAssets: TAssetType[] = [
  {
    src: "https://reader.pubhub.dk/2.2.0/js/chunk-vendors.js",
    type: "script",
  },
  {
    src: "https://reader.pubhub.dk/2.2.0/js/app.js",
    type: "script",
  },
  {
    src: "https://reader.pubhub.dk/2.2.0/css/chunk-vendors.css",
    type: "link",
  },
  {
    src: "https://reader.pubhub.dk/2.2.0/css/app.css",
    type: "link",
  },
]
