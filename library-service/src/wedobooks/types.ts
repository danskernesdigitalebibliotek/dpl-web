/** Configuration passed to `createLibraryService`. */
export interface LibraryServiceConfig {
  applicationId: string
  firebaseApiKey: string
  firebaseProjectId: string
  firebaseAppId: string
  readerApiKey: string
  styling?: { mode: "light" | "dark" }
}

/**
 * Opaque handle returned by `createLibraryService`. Consumers pass it back
 * into `openReader`, `openPlayerBar`, and `getAudioPlayer`; they should not
 * inspect it. The actual runtime value is a `WdbLibrarySdk` instance from
 * `@wedobooks/sdk` — that type is intentionally hidden so the generated
 * declarations stay self-contained (the SDK ships `main.d.ts` with no
 * `types` field in its package.json, which would break type resolution in
 * consumers).
 */
export interface LibraryServiceSdk {
  readonly __wdb: unique symbol
}

export type Checkout = Record<string, unknown>

export interface ReaderCallbacks {
  onClose: () => void
  onFinishBookClick: () => void
}

export interface PlayerCallbacks {
  onClose: () => void
}
