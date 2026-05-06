import { WdbLibrarySdk } from "@wedobooks/sdk"
import type { LibraryServiceConfig, ReaderCallbacks, PlayerCallbacks } from "./types"

export type { LibraryServiceConfig, ReaderCallbacks, PlayerCallbacks } from "./types"
export { signInWithPassword, createSignInToken } from "./auth"
export type {
  SignInWithPasswordConfig,
  SignInWithPasswordResult,
  CreateSignInTokenConfig,
  CreateSignInTokenResult,
} from "./auth"
export { SmokeHarness } from "./SmokeHarness"
export type { SmokeHarnessProps } from "./SmokeHarness"

const DEFAULT_STYLING_MODE = "light" as const

type SdkCheckout = Parameters<WdbLibrarySdk["books"]["openReader"]>[0]["checkout"]

export interface LibraryService {
  // User operations
  signIn(token: string): Promise<{ success: boolean; code?: string } | undefined>
  signOut(): Promise<void>
  readonly currentUserId: string | undefined

  // Loan operations
  canLoan(data: { materialId: string }): Promise<unknown[]>
  loanBook(isbn: string): Promise<{
    success: boolean
    loanId?: string
    quotaReject?: boolean
    estimatedAvailableDate?: string
  }>
  getLoans(uid: string): Promise<unknown[]>
  getLoan(checkoutId: string): Promise<unknown | null>

  // Reader/player operations
  openReader(opts: {
    checkout: unknown
    element: HTMLElement
    callbacks: ReaderCallbacks
  }): Promise<HTMLElement>
  openPlayerBar(opts: {
    checkout: unknown
    element: HTMLElement
    callbacks: PlayerCallbacks
  }): Promise<HTMLElement>
  getAudioPlayer(opts: {
    audioElement: HTMLAudioElement
    checkout: unknown
  }): Promise<unknown>
}

let cachedService: LibraryService | null = null
let cachedConfigKey: string | null = null

function configKey(config: LibraryServiceConfig): string {
  return JSON.stringify([
    config.applicationId,
    config.firebaseApiKey,
    config.firebaseProjectId,
    config.firebaseAppId,
    config.readerApiKey,
    config.styling?.mode ?? DEFAULT_STYLING_MODE,
  ])
}

/**
 * Create (or return the cached) library service for a given config.
 *
 * Must be called in the browser — the underlying SDK touches the DOM and
 * Firebase and will fail on the server.
 */
export function createLibraryService(config: LibraryServiceConfig): LibraryService {
  if (typeof window === "undefined") {
    throw new Error(
      "library-service/wedobooks: createLibraryService() must be called in the browser."
    )
  }

  const key = configKey(config)
  if (cachedService && cachedConfigKey === key) {
    return cachedService
  }

  const sdk = new WdbLibrarySdk({
    applicationId: config.applicationId,
    firebaseApiKey: config.firebaseApiKey,
    firebaseProjectId: config.firebaseProjectId,
    firebaseAppId: config.firebaseAppId,
    readerApiKey: config.readerApiKey,
    styling: config.styling ?? { mode: DEFAULT_STYLING_MODE },
  })

  const service: LibraryService = {
    // User operations
    signIn(token: string) {
      return sdk.users.signIn(token)
    },
    signOut() {
      return sdk.users.signOut()
    },
    get currentUserId() {
      return sdk.users.currentUserId
    },

    // Loan operations
    canLoan(data: { materialId: string }) {
      return sdk.loans.canLoan(data) as Promise<unknown[]>
    },
    loanBook(isbn: string) {
      return sdk.loans.loanBook(isbn) as Promise<{
        success: boolean
        loanId?: string
        quotaReject?: boolean
        estimatedAvailableDate?: string
      }>
    },
    getLoans(uid: string) {
      return sdk.loans.getLoans(uid) as Promise<unknown[]>
    },
    getLoan(checkoutId: string) {
      return sdk.loans.getLoan(checkoutId) as Promise<unknown | null>
    },

    // Reader/player operations
    openReader({ checkout, element, callbacks }) {
      return sdk.books.openReader({
        checkout: checkout as SdkCheckout,
        element,
        callbacks,
      })
    },
    openPlayerBar({ checkout, element, callbacks }) {
      return sdk.books.openPlayerBar({
        checkout: checkout as SdkCheckout,
        element,
        callbacks,
      })
    },
    getAudioPlayer({ audioElement, checkout }) {
      return sdk.books.getAudioPlayer(audioElement, checkout as SdkCheckout)
    },
  }

  cachedService = service
  cachedConfigKey = key
  return service
}
