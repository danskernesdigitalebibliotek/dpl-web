"use client"

import {
  ServiceLayerProvider as Provider,
  type ServiceLayerConfig,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { useMemo } from "react"

import useSession from "@/hooks/useSession"
import { getServiceLayerAuthHeader } from "@/lib/actions/serviceLayerAuth"
import { TServiceType, getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

function ServiceLayerProvider({ children }: React.PropsWithChildren) {
  const { session } = useSession()
  // FBS requires a library login — Unilogin and anonymous sessions must not
  // fire patron-scoped requests. False while the session loads, so patron
  // hooks wait instead of firing doomed 401 calls.
  const isPatronAuthenticated = session?.type === "adgangsplatformen"
  // Digital loans go through the Biblio adapter, which a Unilogin user may use
  // too: Unilogin runs through Adgangsplatformen (ADR-013), so the student
  // holds a real Adgangsplatformen token. FBS stays patron-only above.
  const isDigitalLoanAuthenticated = isPatronAuthenticated || session?.type === "unilogin"
  const config = useMemo<ServiceLayerConfig>(
    () => ({
      getBaseUrl: api => getAPServiceFetcherBaseUrl(api as TServiceType),
      getAuthHeader: api => getServiceLayerAuthHeader(api as TServiceType),
      isPatronAuthenticated,
      isDigitalLoanAuthenticated,
    }),
    [isPatronAuthenticated, isDigitalLoanAuthenticated]
  )
  return <Provider config={config}>{children}</Provider>
}

export default ServiceLayerProvider
