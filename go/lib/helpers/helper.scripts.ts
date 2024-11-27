export type TAssetType = {
  src: string
  type: "script" | "link"
}

export const appendAsset = ({ src, type }: TAssetType) => {
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

export const removeAsset = ({ src, type }: TAssetType) => {
  if (type === "script") {
    const scriptElement = document.querySelector(`script[src="${src}"]`)
    scriptElement?.remove()
  }

  if (type === "link") {
    const linkElement = document.querySelector(`link[href="${src}"]`)
    linkElement?.remove()
  }
}
