"use client"

import {
  readerSignInTokenQuery,
  useServiceLayerConfig,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks"
import { type UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query"

import { useBiblioSdkConfig } from "@/hooks/useBiblioSdkConfig"

/**
 * A WeDoBooks SDK client with the patron signed in, ready to open a book.
 *
 * GO's own sibling of the react apps' useReaderSdk — deliberately not shared:
 * each app binds the SDK to its own config source (the CMS GraphQL
 * configuration here, data attributes there) and its own session model.
 *
 * The SDK keeps its own session against WeDoBooks, so signing in takes two
 * steps: ask the adapter to vouch for the patron we already authenticated,
 * then hand the resulting token to the SDK. Imported lazily because the SDK
 * bundles a reading framework, Firebase and a component library.
 */
export const useReaderSdk = (): UseQueryResult<WedoBooksSdk> => {
  const sdkConfig = useBiblioSdkConfig()
  const config = useServiceLayerConfig()
  const queryClient = useQueryClient()
  // Every step below is patron-scoped, and the token is read straight through
  // the query client, which has no patron gate of its own.
  const isPatronAuthenticated = config.isPatronAuthenticated ?? true

  return useQuery<WedoBooksSdk>({
    // Keyed on the application rather than on the token: signing in again
    // whenever the token rotates would throw away a working session for
    // nothing, since the SDK maintains its own once established.
    queryKey: ["reader", "session", sdkConfig?.applicationId],
    enabled: Boolean(sdkConfig) && isPatronAuthenticated,
    // The client is a page-lifetime singleton behind this query, so letting
    // the cache entry expire would only buy a second sign-in for the same
    // instance.
    staleTime: Infinity,
    gcTime: Infinity,
    // A rejected token is rejected on every attempt - it is cached and does
    // not change between them - so retrying only delays the error by several
    // seconds of backoff.
    retry: false,
    // Surfaced through the error boundary: otherwise a rejected sign-in renders
    // as an empty page, indistinguishable from still loading.
    throwOnError: true,
    queryFn: async () => {
      const [{ createWedoBooksSdk, signInWedoBooksUser }, signInToken] = await Promise.all([
        import("@danskernesdigitalebibliotek/dpl-wedobooks"),
        // fetchQuery honours the staleness the query derives from the
        // token's own expiry: an expired token is refetched and awaited,
        // never served from the cache the way ensureQueryData would.
        queryClient.fetchQuery(readerSignInTokenQuery(config)),
      ])

      // Guaranteed by `enabled`, which gates this query on it.
      const sdk = createWedoBooksSdk(sdkConfig!)
      const { success } = await signInWedoBooksUser(sdk, signInToken.token)
      if (!success) {
        throw new Error("WeDoBooks rejected the sign-in token.")
      }
      return sdk
    },
  })
}
