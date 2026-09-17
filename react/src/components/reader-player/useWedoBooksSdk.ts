import { useQuery } from "@tanstack/react-query";
import type { WedoBooksSdk } from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useReaderSdkConfig from "./useReaderSdkConfig";

/**
 * The WeDoBooks SDK client, constructed but not signed in.
 *
 * This is all a sample needs: the SDK's url-based sample functions never
 * reach WeDoBooks' backend, so there is no session to establish. A loan is
 * different - it has to be opened as the patron who holds it, which is what
 * `useReaderSdk` adds on top of this.
 *
 * The client is a page-lifetime singleton behind this query (see
 * `createWedoBooksSdk`), so there is one instance whoever asks for it.
 */
const useWedoBooksSdk = () => {
  const config = useReaderSdkConfig();

  return useQuery<WedoBooksSdk>({
    // Keyed on the application: one client per set of credentials.
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

export default useWedoBooksSdk;
