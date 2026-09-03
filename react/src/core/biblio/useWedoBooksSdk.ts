import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  biblioSignInTokenQuery,
  useServiceLayerConfig
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { isAnonymous } from "../utils/helpers/user";
import type { WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useWedoBooksConfig from "./useWedoBooksConfig";

/**
 * A WeDoBooks SDK client with the patron signed in, ready to open a book.
 *
 * The SDK keeps its own session against WeDoBooks rather than going through
 * the adapter, so using it takes two steps: ask the adapter to vouch for the
 * patron we already authenticated, then hand the resulting token to the SDK.
 * Both are folded in here, because a client that is not signed in cannot do
 * anything a caller would want.
 *
 * ## Why it is loaded on demand
 *
 * The SDK bundles a full reading framework, Firebase and a component library -
 * megabytes that only matter to someone opening a book. Importing it lazily
 * keeps it out of every other app's bundle, so the cost lands on the reader
 * page rather than on the front page.
 */
const useWedoBooksSdk = () => {
  const config = useWedoBooksConfig();
  const serviceLayerConfig = useServiceLayerConfig();
  const queryClient = useQueryClient();
  // The reader page is public, so an anonymous visitor can reach it with a
  // loan id in the url. Every step below is patron-scoped - the token is
  // minted for a person - so there is nothing to do without a session.
  // Checked here because the token is read straight through the query client,
  // which has no patron gate of its own.
  const isUserAnonymous = isAnonymous();

  return useQuery<WedoBooksSdk>({
    // Keyed on the application rather than on the token: signing in again
    // whenever the token rotates would throw away a working session for
    // nothing, since the SDK maintains its own once established.
    queryKey: ["wedobooks", "session", config?.applicationId],
    enabled: Boolean(config) && !isUserAnonymous,
    // The client is a page-lifetime singleton behind this query, so letting
    // the cache entry expire would only buy a second sign-in for the same
    // instance.
    staleTime: Infinity,
    gcTime: Infinity,
    // A rejected token is rejected on every attempt - it is cached and does
    // not change between them - so retrying only delays the error by several
    // seconds of backoff.
    retry: false,
    // Surfaced through the app's error boundary rather than swallowed. Without
    // this a rejected sign-in renders as an empty page, which is
    // indistinguishable from still loading and hides the one thing worth
    // knowing - that WeDoBooks turned the patron away.
    throwOnError: true,
    queryFn: async () => {
      // Started together: the token round trip and the multi-megabyte chunk
      // have nothing to do with each other, and doing them in sequence would
      // add the slower one to the wait for no reason.
      const [{ createWedoBooksSdk, signInWedoBooksUser }, signInToken] =
        await Promise.all([
          import("@danskernesdigitalebibliotek/dpl-wedobooks"),
          // fetchQuery honours the staleness the query derives from the
          // token's own expiry: an expired token is refetched and awaited,
          // never served from the cache the way ensureQueryData would.
          queryClient.fetchQuery(biblioSignInTokenQuery(serviceLayerConfig))
        ]);

      // Guaranteed by `enabled`, which gates this query on it.
      const sdk = createWedoBooksSdk(config!);
      const { success } = await signInWedoBooksUser(sdk, signInToken.token);
      if (!success) {
        throw new Error("WeDoBooks rejected the sign-in token.");
      }
      return sdk;
    }
  });
};

export default useWedoBooksSdk;
