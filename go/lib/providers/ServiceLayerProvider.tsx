"use client"

import {
  ServiceLayerProvider as Provider,
  type ServiceLayerConfig,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React, { createContext, useContext, useMemo } from "react"

import useSession from "@/hooks/useSession"
import { getServiceLayerAuthHeader } from "@/lib/actions/serviceLayerAuth"
import { TServiceType, getAPServiceFetcherBaseUrl } from "@/lib/helpers/ap-service"

// Whether the session behind the service layer config has loaded. Until it
// has, patron-scoped queries are off because the session is unknown, not
// because there is no patron. True without a provider (Storybook, tests).
const SessionResolvedContext = createContext(true)

export const useIsServiceLayerSessionResolved = () => useContext(SessionResolvedContext)

function ServiceLayerProvider({ children }: React.PropsWithChildren) {
  const { session, isLoading } = useSession()
  // FBS requires a library login — Unilogin and anonymous sessions must not
  // fire patron-scoped requests. False while the session loads, so patron
  // hooks wait instead of firing doomed 401 calls.
  const isPatronAuthenticated = session?.type === "adgangsplatformen"
  // Digital loans go through the Biblio adapter, which a Unilogin user may use
  // too: Unilogin runs through Adgangsplatformen (ADR-013), so the student
  // holds a real Adgangsplatformen token. FBS stays patron-only above.
  const canUseDigitalLoans = isPatronAuthenticated || session?.type === "unilogin"
  const config = useMemo<ServiceLayerConfig>(
    () => ({
      getBaseUrl: api => getAPServiceFetcherBaseUrl(api as TServiceType),
      getAuthHeader: api => getServiceLayerAuthHeader(api as TServiceType),
      isPatronAuthenticated,
      canUseDigitalLoans,
    }),
    [isPatronAuthenticated, canUseDigitalLoans]
  )
  return (
    <Provider config={config}>
      <SessionResolvedContext value={!isLoading}>{children}</SessionResolvedContext>
    </Provider>
  )
}

export default ServiceLayerProvider
