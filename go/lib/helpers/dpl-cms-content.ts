type TDplCmsContentType = "article" | "page" | "category"

export const getContentQueryPath = (path: string, type: TDplCmsContentType) => {
  const pathMap = {
    article: `artikel/${path}`,
    page: `${path}`,
    category: `kategori/${path}`,
  }

  return pathMap[type] ?? path
}
