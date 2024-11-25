type TAssetType = {
  src: string
  type: "script" | "link"
}

export const assets: TAssetType[] = [
  {
    src: "https://play.pubhub.dk/1.3.0/js/player-kernel.min.js",
    type: "script",
  },
]

export const appendAsset = ({ src, type }: TAssetType) => {
  if (type === "script") {
    const scriptElement = document.createElement("script")
    scriptElement.src = src
    scriptElement.defer = true
    scriptElement.async = false
    scriptElement.type = "module"
    document.head.appendChild(scriptElement)
  }
}

export const removeAsset = ({ src, type }: TAssetType) => {
  if (type === "script") {
    const scriptElement = document.querySelector(`script[src="${src}"]`)
    scriptElement?.remove()
  }
}
