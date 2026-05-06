/** Configuration passed to `createLibraryService`. */
export interface LibraryServiceConfig {
  applicationId: string
  firebaseApiKey: string
  firebaseProjectId: string
  firebaseAppId: string
  readerApiKey: string
  styling?: { mode: "light" | "dark" }
}

export interface ReaderCallbacks {
  onClose: () => void
  onFinishBookClick: () => void
}

export interface PlayerCallbacks {
  onClose: () => void
}
