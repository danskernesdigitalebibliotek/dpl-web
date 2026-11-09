export type ConnectionSettings = {
  libraryToken: string
  userToken: string
  fbiUrl: string
  fbsUrl: string
}

// The path segment of the FBI url is a profile, which DBC sets up per library
// agency; each CMS site configures its own. A profile the token's agency lacks
// answers 200 with empty results. "opac" returns data for the agency of the
// tokens we test with (723000), where the CMS fallback "next" returns nothing.
const defaultConnectionSettings: ConnectionSettings = {
  libraryToken: "",
  userToken: "",
  fbiUrl: "https://fbi-api.dbc.dk/opac/graphql",
  fbsUrl: "https://fbs-openplatform.dbc.dk",
}

// sessionStorage keeps the pasted tokens out of the build and drops them when
// the tab closes.
const storageKey = "work-page-poc:connection"

const readStoredSettings = (): ConnectionSettings => {
  try {
    const stored = window.sessionStorage.getItem(storageKey)
    return stored
      ? { ...defaultConnectionSettings, ...(JSON.parse(stored) as Partial<ConnectionSettings>) }
      : defaultConnectionSettings
  } catch {
    return defaultConnectionSettings
  }
}

let currentSettings = readStoredSettings()
const listeners = new Set<() => void>()

/**
 * The settings as they are right now. Request code calls this per request
 * rather than closing over a rendered value, so a refetch triggered by saving
 * new tokens already uses them.
 */
export const getConnectionSettings = () => currentSettings

export const setConnectionSettings = (settings: ConnectionSettings) => {
  currentSettings = settings
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(settings))
  } catch {
    // Storage can be unavailable (private mode); the settings then last until reload.
  }
  listeners.forEach((listener) => listener())
}

export const subscribeToConnectionSettings = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** The token requests are sent with: the patron's when given, as in react/. */
export const getActiveToken = (settings: ConnectionSettings) =>
  settings.userToken || settings.libraryToken
