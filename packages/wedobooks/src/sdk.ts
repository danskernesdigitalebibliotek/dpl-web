import { WdbLibrarySdk } from "@wedobooks/sdk"
import type {
  Checkout,
  ReaderMaterialData,
  SampleMaterialData,
  WdbSessionInterruption,
  WdbSessionState,
} from "@wedobooks/sdk"

/**
 * The reader and the player, wrapped so the rest of the platform never imports
 * the SDK directly: `build.mjs` pre-bundles around Colibrio's UMD modules (see
 * there), and the SDK touches `window` on construction, so the browser guard
 * lives here once instead of in every caller.
 */

/** The SDK client the reader and the player are opened through. */
export type WedoBooksSdk = WdbLibrarySdk

/**
 * An entitlement as the SDK understands it - the record that says this user may
 * open this material. `openPlayerBar` needs all of it; `openReader` takes the
 * narrower `WedoBooksReaderMaterial`.
 */
export type WedoBooksCheckout = Checkout

/** The subset of a checkout the reader needs: no dates, only identity. */
export type WedoBooksReaderMaterial = ReaderMaterialData

/**
 * What a sample shows about the material it excerpts.
 *
 * A url-opened sample never reaches WeDoBooks' catalogue, so these have to
 * come from ours. The material type is left out: each sample component mounts
 * one type and states it itself, so a caller cannot pair them wrongly.
 */
export type WedoBooksSampleMaterial = Omit<SampleMaterialData, "material_type">

/**
 * Why the SDK closed a reader or player on its own. A patron reads or listens
 * in one place at a time: opening the loan elsewhere - another device, or
 * another tab of this browser - takes the session, and a device WeDoBooks no
 * longer recognises loses it. A loan that expires while open is closed too.
 * Samples are never interrupted.
 */
export type WedoBooksSessionInterruption = WdbSessionInterruption

/**
 * For the SDK's `onError`. The reader and player keep their own error screen
 * on the page, so there is nothing for a caller to show - but the error itself
 * is what support needs to see.
 */
export const reportSdkError = (error: unknown): void =>
  console.warn("WeDoBooks could not show the content", error)

/**
 * Why the SDK refused to open a book, mounting nothing, where the refusal is
 * not one of the interruptions above. A patron may have only so many devices
 * registered, and a browser outside that list cannot open anything until one
 * is removed - see `WedoBooksDeviceSession`. The SDK's codes are a growing
 * set, so only the one acted on is named and the rest fall together.
 */
export type WedoBooksOpenFailure = { reason: "device_limit_reached" } | { reason: "open_failed" }

/**
 * Every way the SDK can end up not showing a loan: it closed what it had
 * opened because the session moved, or it refused to open at all. One union,
 * so a page keeps one state and switches on `reason`.
 */
export type WedoBooksStopReason = WedoBooksSessionInterruption | WedoBooksOpenFailure

/**
 * Why an open was refused, as the page should explain it. A device revoked
 * while opening is the same event as one revoked after, so it is reported as
 * that interruption rather than as a fault. A session taken while opening is
 * not told apart: the SDK answers `failed_precondition` for that and for other
 * preconditions alike, and its own `interruptedBy` may be left over from an
 * earlier loan, so it falls together with the rest.
 */
export function stopReasonOf(error: unknown): WedoBooksStopReason {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? (error as { code: unknown }).code
      : null
  switch (code) {
    case "device_limit_reached":
    case "device_revoked":
      return { reason: code }
    default:
      return { reason: "open_failed" }
  }
}

/** A device registered to the patron, as the SDK lists it. */
export interface WedoBooksDevice {
  id: string
  /** The browser and system it runs on, or the label the integration gave it. */
  name: string
  /** When it last opened content, as an ISO timestamp; null if unknown. */
  lastUsed: string | null
}

/** The patron's devices and how many they may have. */
export interface WedoBooksDevices {
  devices: WedoBooksDevice[]
  limit: number
}

const toDevices = (state: WdbSessionState): WedoBooksDevices => ({
  devices: state.devices.map(device => ({
    id: device.id,
    name: device.name,
    lastUsed: device.lastUsed.toISO(),
  })),
  limit: state.deviceLimit,
})

/**
 * Follow the patron's device list. The listener gets the current list at once
 * and again on every change; the returned function stops it.
 */
export function watchWedoBooksDevices(
  sdk: WedoBooksSdk,
  listener: (devices: WedoBooksDevices) => void
): () => void {
  const subscription = sdk.deviceSession.state$.subscribe(state => listener(toDevices(state)))
  return () => subscription.unsubscribe()
}

// How long to wait for the SDK's device list to drop a removed device before
// opening anyway. The list lags the backend's answer by moments, not seconds.
const DEVICE_LIST_SETTLE_MS = 5000

/**
 * Remove one of the patron's devices, which frees its place. Nothing else ever
 * frees one: the SDK removes no device on the patron's behalf. Opening content
 * afterwards registers this browser in the freed place.
 *
 * Resolves once the SDK's own list no longer holds the device, not when the
 * backend has answered: the SDK judges an open against the list it holds, and
 * that lags the answer by a moment, so an open on the answer alone is refused
 * again for want of room. The wait is bounded from the answer, since the lag
 * is what it waits out. (The SDK's `removeDevice` should wait for its own list
 * the way its session claim does; this goes when it does.) Resolves to whether
 * the device was removed; a refusal leaves it in the list, which the list
 * already shows.
 */
export async function removeWedoBooksDevice(
  sdk: WedoBooksSdk,
  deviceId: string
): Promise<boolean> {
  try {
    await sdk.deviceSession.removeDevice(deviceId)
  } catch {
    return false
  }

  // The stream replays its current value, so a list that has already dropped
  // the device resolves at once.
  let unwatch = () => {}
  let timer: ReturnType<typeof setTimeout> | undefined
  await new Promise<void>(resolve => {
    timer = setTimeout(resolve, DEVICE_LIST_SETTLE_MS)
    unwatch = watchWedoBooksDevices(sdk, ({ devices }) => {
      if (!devices.some(device => device.id === deviceId)) resolve()
    })
  })
  clearTimeout(timer)
  unwatch()
  return true
}

/** What the SDK needs to start. Provisioned by WeDoBooks, served by the CMS. */
export interface WedoBooksSdkConfig {
  applicationId: string
  firebaseApiKey: string
  firebaseProjectId: string
  firebaseAppId: string
  readerApiKey: string
  styling?: { mode: "light" | "dark" }
}

export type WedoBooksSignInResult = { success: boolean }

const DEFAULT_STYLING_MODE = "light" as const

let cachedSdk: WdbLibrarySdk | null = null

/**
 * The SDK client, created once per page.
 *
 * Constructing it initialises Firebase, and a second instance would mean a
 * second auth session. The cache ignores `config` on purpose: the CMS serves
 * one value for the whole page.
 */
export function createWedoBooksSdk(config: WedoBooksSdkConfig): WedoBooksSdk {
  if (typeof window === "undefined") {
    throw new Error("createWedoBooksSdk() must be called in the browser.")
  }

  if (cachedSdk) {
    return cachedSdk
  }

  cachedSdk = new WdbLibrarySdk({
    applicationId: config.applicationId,
    firebaseApiKey: config.firebaseApiKey,
    firebaseProjectId: config.firebaseProjectId,
    firebaseAppId: config.firebaseAppId,
    readerApiKey: config.readerApiKey,
    styling: config.styling ?? { mode: DEFAULT_STYLING_MODE },
  })
  return cachedSdk
}

/**
 * Open the SDK's session for the patron the token was minted for.
 *
 * The token comes from the Biblio adapter, which vouches for a patron we have
 * already authenticated - so this is where our session becomes WeDoBooks'.
 *
 * Note that the SDK reports a refused sign-in as a resolved result rather than
 * a rejection, so callers must read `success` instead of relying on a throw.
 */
export async function signInWedoBooksUser(
  sdk: WedoBooksSdk,
  customToken: string
): Promise<WedoBooksSignInResult> {
  const result = await sdk.users.signIn(customToken)
  return { success: Boolean(result?.success) }
}
