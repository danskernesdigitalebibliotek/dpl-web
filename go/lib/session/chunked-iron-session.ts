import {
  IronSession,
  SessionOptions,
  sealData,
  unsealData,
} from "iron-session"

// Minimal subset of next/headers' cookie store that we depend on.
interface CookieStore {
  get(name: string): { name: string; value: string } | undefined
  set(name: string, value: string, options?: Record<string, unknown>): void
}

// Browsers reject Set-Cookie payloads larger than ~4096 bytes. We size each
// chunk well below that to leave headroom for the cookie name and attributes.
const DEFAULT_CHUNK_SIZE = 3500
const MAX_COOKIE_SIZE = 4096

const chunkName = (cookieName: string, index: number) => `${cookieName}.${index}`

const readSealFromChunks = (cookieStore: CookieStore, cookieName: string): string => {
  // Sessions that fit in a single cookie keep the original name, so prefer it.
  const direct = cookieStore.get(cookieName)?.value
  if (direct) return direct

  const chunks: string[] = []
  for (let i = 0; ; i++) {
    const value = cookieStore.get(chunkName(cookieName, i))?.value
    if (!value) break
    chunks.push(value)
  }
  return chunks.join("")
}

const clearChunks = (
  cookieStore: CookieStore,
  cookieName: string,
  cookieOptions: Record<string, unknown>
) => {
  for (let i = 0; ; i++) {
    const name = chunkName(cookieName, i)
    if (!cookieStore.get(name)?.value) break
    cookieStore.set(name, "", { ...cookieOptions, maxAge: 0 })
  }
}

const splitIntoChunks = (value: string, chunkSize: number): string[] => {
  const chunks: string[] = []
  for (let i = 0; i < value.length; i += chunkSize) {
    chunks.push(value.slice(i, i + chunkSize))
  }
  return chunks
}

export interface ChunkingOptions {
  chunkSize?: number
}

/**
 * Drop-in replacement for iron-session's `getIronSession(cookieStore, …)` that
 * transparently splits oversized seals across multiple cookies
 * (`{cookieName}.0`, `{cookieName}.1`, …) and reassembles them on read.
 *
 * Mirrors PR vvo/iron-session#937 until upstream merges.
 */
export async function getChunkedIronSession<T extends object>(
  cookieStore: CookieStore,
  sessionOptions: SessionOptions,
  chunking: ChunkingOptions = {}
): Promise<IronSession<T>> {
  const ttl = sessionOptions.ttl ?? 60 * 60 * 24 * 14
  // Match iron-session: cookie expires 60s before the seal so the browser
  // never sends a cookie we'd reject as expired.
  const cookieOptions: Record<string, unknown> = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    ...sessionOptions.cookieOptions,
    ...(ttl === 0 ? {} : { maxAge: ttl - 60 }),
  }
  const chunkSize = chunking.chunkSize ?? DEFAULT_CHUNK_SIZE

  const seal = readSealFromChunks(cookieStore, sessionOptions.cookieName)
  let data: T = {} as T
  if (seal) {
    try {
      data = await unsealData<T>(seal, {
        password: sessionOptions.password,
        ttl,
      })
    } catch {
      // Corrupt/expired seal — start with an empty session, same as iron-session.
      data = {} as T
    }
  }

  const save = async () => {
    const newSeal = await sealData(data, {
      password: sessionOptions.password,
      ttl,
    })

    // Always purge any existing chunks before deciding the new layout, so we
    // never leak stale chunks across a chunked→single (or larger→smaller)
    // transition.
    clearChunks(cookieStore, sessionOptions.cookieName, cookieOptions)

    const singleCookieSize =
      sessionOptions.cookieName.length +
      newSeal.length +
      JSON.stringify(cookieOptions).length

    if (singleCookieSize <= MAX_COOKIE_SIZE) {
      cookieStore.set(sessionOptions.cookieName, newSeal, cookieOptions)
      return
    }

    // Seal won't fit in one cookie — clear the main cookie and write chunks.
    cookieStore.set(sessionOptions.cookieName, "", { ...cookieOptions, maxAge: 0 })
    splitIntoChunks(newSeal, chunkSize).forEach((chunk, index) => {
      cookieStore.set(chunkName(sessionOptions.cookieName, index), chunk, cookieOptions)
    })
  }

  const destroy = () => {
    for (const key of Object.keys(data)) {
      delete (data as Record<string, unknown>)[key]
    }
    cookieStore.set(sessionOptions.cookieName, "", { ...cookieOptions, maxAge: 0 })
    clearChunks(cookieStore, sessionOptions.cookieName, cookieOptions)
  }

  // Methods are non-enumerable so JSON.stringify/Object.assign/sealData
  // don't accidentally serialize them into the cookie.
  Object.defineProperties(data, {
    save: { value: save },
    destroy: { value: destroy },
    updateConfig: {
      value: () => {
        // Not used in this codebase; left as a no-op for IronSession parity.
      },
    },
  })

  return data as IronSession<T>
}
