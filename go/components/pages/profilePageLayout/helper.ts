import { getDigitalSupportId } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { QueryClient } from "@tanstack/react-query"

import { getServiceLayerConfig } from "@/lib/helpers/service-layer"
import type { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"

// Publizon's support ID (friendlyCardNumber) only exists in the user loans
// response, so it is read from the prefetched loans in the query cache.
// TODO(publizon-sunset): remove together with the Publizon loans.
export const getPublizonSupportId = (queryClient: QueryClient) =>
  queryClient.getQueryData<LoanListResult>(getGetV1UserLoansAdapterQueryKey())?.userData
    ?.friendlyCardNumber ?? null

// Biblio's support ID — the same id the adult site shows. A failure only
// hides the line, never the page.
export const getBiblioSupportId = (userToken: string) =>
  getDigitalSupportId(getServiceLayerConfig(userToken)).catch(() => null)
