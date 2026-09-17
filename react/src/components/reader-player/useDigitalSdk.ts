import { useQuery } from "@tanstack/react-query";
import type { WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useDigitalSdkConfig from "./useDigitalSdkConfig";

/**
 * The WeDoBooks SDK client as a sample needs it: constructed, not signed in.
 *
 * The SDK's url-based sample functions never reach WeDoBooks' backend, so
 * there is no session to establish, and a visitor who is not signed in can
 * use it. A loan is different - it has to be opened as the patron who holds
 * it, which is what `useDigitalSdkSession` adds on top of this same client.
 *
 * The client is a page-lifetime singleton behind this query (see
 * `createWedoBooksSdk`), so there is one instance whoever asks for it.
 */
const useDigitalSdk = () => {
  const config = useDigitalSdkConfig();

  return useQuery<WedoBooksSdk>({
    // The application id is in the key to say which credentials the client was
    // built from, not to get a second one: `createWedoBooksSdk` caches the
    // first client it makes and ignores the config afterwards, because a
    // second instance would mean a second Firebase auth session.
    queryKey: ["reader", "sdk", config?.applicationId],
    enabled: Boolean(config),
    // The client outlives any staleness the cache could express.
    staleTime: Infinity,
    gcTime: Infinity,
    // Constructing it fails the same way every time, so retrying only delays
    // the error by several seconds of backoff.
    retry: false,
    // Surfaced through the error boundary: otherwise a failure renders as an
    // empty page, indistinguishable from still loading.
    throwOnError: true,
    queryFn: async () => {
      // Imported lazily because the SDK bundles a reading framework, Firebase
      // and a component library.
      const { createWedoBooksSdk } =
        await import("@danskernesdigitalebibliotek/dpl-wedobooks");
      // Guaranteed by `enabled`, which gates this query on it.
      return createWedoBooksSdk(config!);
    }
  });
};

export default useDigitalSdk;
