export const cyKeys = {
  "go-logo": "go-logo",
  "search-input": "search-input",
  "work-card": "work-card",
  "work-card-title": "work-card-title",
  "filters-button": "filters-button",
  "filter-button": "filter-button",
  "video-bundle": "video-bundle",
  "video-bundle-prev-button": "video-bundle-prev-button",
  "video-bundle-next-button": "video-bundle-next-button",
} as const

export type CyKey = keyof typeof cyKeys
