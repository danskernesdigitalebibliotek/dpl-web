"use client"

import {
  readerSignInTokenQuery,
  useServiceLayerConfig,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks"
import { type UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query"

import { useReaderSdk } from "@/hooks/useReaderSdk"

/**
 * The SDK with the patron signed in, ready to open a book they hold.
 *
 * The SDK keeps its own session against WeDoBooks, so signing in takes two
 * steps: ask the adapter to vouch for the patron we already authenticated,
 * then hand the resulting token to the SDK. Everything up to that point is
 * `useReaderSdk`, which is the same client before anyone is signed in.
 */
export const useReaderSdkSession = (): UseQueryResult<WedoBooksSdk> => {
  const { data: sdk } = useReaderSdk()
  const config = useServiceLayerConfig()
  const queryClient = useQueryClient()
  // Signing in is patron-scoped, and the token is read straight through the
  // query client, which has no patron gate of its own.
  const isPatronAuthenticated = config.isPatronAuthenticated ?? true

  return useQuery<WedoBooksSdk>({
    // Not keyed on the token: signing in again whenever it rotates would
    // throw away a working session for nothing, since the SDK maintains its
    // own once established. Nor on the application - the one client this
    // signs in is already keyed on that.
    queryKey: ["reader", "session"],
    enabled: Boolean(sdk) && isPatronAuthenticated,
    staleTime: Infinity,
    gcTime: Infinity,
    // A rejected token is rejected on every attempt - it is cached and does
    // not change between them - so retrying only delays the error by several
    // seconds of backoff.
    retry: false,
    // Surfaced through the error boundary: otherwise a rejected sign-in
    // renders as an empty page, indistinguishable from still loading.
    throwOnError: true,
    queryFn: async () => {
      const [{ signInWedoBooksUser }, signInToken] = await Promise.all([
        import("@danskernesdigitalebibliotek/dpl-wedobooks"),
        // fetchQuery honours the staleness the query derives from the
        // token's own expiry: an expired token is refetched and awaited,
        // never served from the cache the way ensureQueryData would.
        queryClient.fetchQuery(readerSignInTokenQuery(config)),
      ])

      // Guaranteed by `enabled`, which gates this query on it.
      const { success } = await signInWedoBooksUser(sdk!, signInToken.token)
      if (!success) {
        throw new Error("WeDoBooks rejected the sign-in token.")
      }
      return sdk!
    },
  })
}
