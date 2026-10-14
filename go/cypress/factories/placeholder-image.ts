// A placeholder like placehold.co's, inline, so stories and tests load no
// image from another server.
export const placeholderImageUrl = (width: number, height: number) => {
  const fontSize = Math.round(Math.min(width, height) / 6)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ddd"/><text x="50%" y="50%" fill="#999" font-family="sans-serif" font-size="${fontSize}" text-anchor="middle" dominant-baseline="central">${width}x${height}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}
