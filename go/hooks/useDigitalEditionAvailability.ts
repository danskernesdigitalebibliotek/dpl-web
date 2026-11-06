"use client"

import { useQuery } from "@tanstack/react-query"

import {
  isAudioMaterialType,
  isEbookMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import {
  type TDigitalAvailability,
  isDigitalEditionUnavailable,
  mapDigitalAvailability,
} from "@/lib/helpers/helper.digitalAvailability"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import {
  getV1LoanstatusIdentifierAdapter,
  postV1LoanstatusAdapter,
} from "@/lib/rest/publizon/adapter/generated/publizon"

const isDigitalMaterialType = (code: string | undefined): boolean =>
  !!code && (isEbookMaterialType(code) || isAudioMaterialType(code) || isPodcastMaterialType(code))

// Every digital identifier of a work. Part of the query key, so all callers
// must ask about the same set to share one request.
const useWorkDigitalIdentifiers = (wid: string) => {
  const { data, isLoading } = useGetMaterialQuery({ wid }, { enabled: !!wid })

  const identifiers = ((data?.work?.manifestations?.all ?? []) as ManifestationWorkPageFragment[])
    .filter(manifestation =>
      isDigitalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
    )
    .map(getPublizonIdentifierFromManifestation)
    .filter((identifier): identifier is string => !!identifier)

  return { identifiers, isLoading }
}

// Publizon rejects a whole batch over one identifier it will not accept, so a
// rejected batch is retried one identifier at a time. Losing the status of
// every digital edition on the page to one bad id is the alternative.
//
// Rethrows when every identifier failed too: that is Publizon being
// unreachable rather than one bad id, and the caller has to be able to tell
// "unknown" from "all available".
const fetchDigitalAvailability = async (identifiers: string[]): Promise<TDigitalAvailability> => {
  try {
    const result = await postV1LoanstatusAdapter(identifiers)
    // The fetcher answers null for an empty response, so the type is wider
    // than it declares.
    return mapDigitalAvailability(result?.items)
  } catch (batchError) {
    const results = await Promise.all(
      identifiers.map(identifier => getV1LoanstatusIdentifierAdapter(identifier).catch(() => null))
    )
    const answered = results.filter(result => result !== null)
    if (answered.length === 0) throw batchError

    return mapDigitalAvailability(answered)
  }
}

// Whether a digital edition can be borrowed right now. Digital editions have
// no FBS record, so this is the Publizon counterpart to
// useEditionAvailability.
//
// Publizon is the older of the two providers; libraries moving to the Biblio
// adapter are answered by the service layer instead. GO has no Biblio
// adapter yet, so only this path applies.
// See docs/go/material-availability.md
export const useDigitalEditionAvailability = (wid: string) => {
  const { identifiers, isLoading: isLoadingWork } = useWorkDigitalIdentifiers(wid)

  const {
    data: availability,
    isLoading,
    isError,
  } = useQuery({
    // The batch endpoint is a POST, so it is wrapped in a query to be cached
    // and shared the way the per-record FBS answer is.
    // Sorted so every caller lands on the same key: the ids arrive in
    // whatever order the work query answers, and three components on the page
    // ask the same question.
    queryKey: ["publizon", "loanstatus", [...identifiers].sort()],
    queryFn: () => fetchDigitalAvailability(identifiers),
    enabled: identifiers.length > 0,
  })

  const isLoadingDigitalAvailability = isLoadingWork || (identifiers.length > 0 && isLoading)

  const isResolved = !isLoadingDigitalAvailability && !isError && identifiers.length > 0

  // False for anything Publizon cannot speak for: physical editions, and
  // anything asked before the answer is in.
  const isDigitalEditionOnLoan = (manifestation: ManifestationWorkPageFragment): boolean => {
    if (!isResolved) return false
    if (!isDigitalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)) {
      return false
    }

    return isDigitalEditionUnavailable(
      availability,
      getPublizonIdentifierFromManifestation(manifestation)
    )
  }

  return {
    isLoadingDigitalAvailability,
    isDigitalAvailabilityUnknown: isError,
    isDigitalEditionOnLoan,
  }
}
