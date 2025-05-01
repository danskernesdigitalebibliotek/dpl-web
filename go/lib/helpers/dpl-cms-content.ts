type TDplCmsContentType = "article" | "page" | "category"

export const getContentQueryPath = (path: string, type: TDplCmsContentType) => {
  const pathMap = {
    article: `go/artikel/${path}`,
    page: `go/${path}`,
    category: `go/kategori/${path}`,
  }

  return pathMap[type] ?? path
}
