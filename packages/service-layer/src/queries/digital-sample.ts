import { queryOptions } from "@tanstack/react-query"

import { getDigitalSample } from "../digital-sample"
import type { ServiceLayerConfig } from "../types"
import { serviceLayerNamespace } from "./namespace"

export const digitalSampleQueryKey = (materialId: string | null) =>
  [serviceLayerNamespace, "digitalSample", materialId] as const

export const digitalSampleQuery = (config: ServiceLayerConfig, materialId: string | null) =>
  queryOptions({
    queryKey: digitalSampleQueryKey(materialId),
    // Never refetched. The url is what the SDK is mounted on, so a freshly
    // signed one would tear the open reader down mid-read and start the book
    // over - and the signature changes on every call. The page that opens a
    // sample fetches its own, so nothing here has to outlive the page.
    staleTime: Infinity,
    // An excerpt is an offer, never a reason to take the page down. The host's
    // default sends a failed query to the error boundary, which on a material
    // page would replace the loan and reserve buttons - and for a visitor who
    // is not signed in this is the only query that runs at all, so it would be
    // the only thing able to break their page. A failure just means no teaser,
    // and it stays visible in the network log and the query cache.
    throwOnError: false,
    // The likeliest failure is the adapter's 403 where Biblio has not switched
    // samples on in this environment yet, and that never resolves by asking
    // again.
    retry: false,
    queryFn: () => {
      if (materialId === null) {
        // The hook disables itself without a material id; a direct caller of
        // the query options must not end up fetching /v1/samples/null.
        throw new Error("digitalSampleQuery cannot fetch without a material id")
      }
      return getDigitalSample(config, materialId)
    },
  })
