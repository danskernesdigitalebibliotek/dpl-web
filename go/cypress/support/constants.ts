export const cyKeys = {
  "go-logo": "go-logo",
  "search-input": "search-input",
  "work-card": "work-card",
  "work-card-title": "work-card-title",
  "filters-button": "filters-button",
  "filter-button": "filter-button",
  "material-slider": "material-slider",
  "material-slider-skeleton": "material-slider-skeleton",
  "material-slider-prev-button": "material-slider-prev-button",
  "material-slider-next-button": "material-slider-next-button",
  "video-bundle": "video-bundle",
  "video-bundle-slider": "video-bundle-slider",
  "video-bundle-prev-button": "video-bundle-prev-button",
  "video-bundle-next-button": "video-bundle-next-button",
  "profile-button": "profile-button",
  "global-sheet": "global-sheet",
  "global-sheet-close-button": "global-sheet-close-button",
  "login-sheet-unilogin-button": "login-sheet-unilogin-button",
  "login-sheet-adgangsplatformen-button": "login-sheet-adgangsplatformen-button",
  "logout-button": "logout-button",
  "loan-slider": "loan-slider",
  "loan-slider-work": "loan-slider-work",
  "loan-slider-prev-button": "loan-slider-prev-button",
  "loan-slider-next-button": "loan-slider-next-button",
} as const

export type CyKey = keyof typeof cyKeys

// Define viewport configurations
export const viewports = {
  mobile: {
    width: 375,
    height: 667,
  },
  desktop: {
    width: 1280,
    height: 720,
  },
} as const

export type ViewportType = keyof typeof viewports
