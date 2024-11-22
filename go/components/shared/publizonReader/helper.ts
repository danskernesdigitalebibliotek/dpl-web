type AssetType = {
  src: string
  type: "script" | "link"
}

export const readerAssets: AssetType[] = [
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

export const appendAsset = ({ src, type }: AssetType) => {
  if (type === "script") {
    const scriptElement = document.createElement("script")
    scriptElement.src = src
    scriptElement.defer = true
    scriptElement.async = false
    scriptElement.type = "module"
    document.head.appendChild(scriptElement)
  }

  if (type === "link") {
    const linkElement = document.createElement("link")
    linkElement.href = src
    linkElement.rel = "stylesheet"
    document.head.appendChild(linkElement)
  }
}

export const removeAsset = ({ src, type }: AssetType) => {
  if (type === "script") {
    const scriptElement = document.querySelector(`script[src="${src}"]`)
    scriptElement?.remove()
  }

  if (type === "link") {
    const linkElement = document.querySelector(`link[href="${src}"]`)
    linkElement?.remove()
  }
}
