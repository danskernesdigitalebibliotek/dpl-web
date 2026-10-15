// One URL per size, as placehold.co has.
const blobUrls = new Map<string, string>()

// A placeholder like placehold.co's, inline, so stories and tests load no
// image from another server.
export const placeholderImageUrl = (width: number, height: number) => {
  const fontSize = Math.round(Math.min(width, height) / 6)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" fill="#999" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${width}x${height}</text></svg>`
  // Outside a browser, as in Cypress' Node process, only a data URL works.
  if (typeof window === "undefined") {
    return `data:image/svg+xml,${encodeURIComponent(svg)}`
  }
  // A blob URL in browsers: Chromium takes data URLs in a srcset as already
  // loaded, and so picks the largest instead of the one a real cover gets.
  const size = `${width}x${height}`
  if (!blobUrls.has(size)) {
    blobUrls.set(size, URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })))
  }
  return blobUrls.get(size) as string
}
