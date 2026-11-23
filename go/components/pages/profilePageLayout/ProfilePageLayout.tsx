import { getDigitalSupportId } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { cookies } from "next/headers"
import React, { Suspense } from "react"

import { LoanSliderSkeleton } from "@/components/shared/loanSlider/LoanSlider"
import LogoutButton from "@/components/shared/logoutButton/LogoutButton"
import { PhysicalLoanSliderSkeleton } from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import PhysicalLoans from "@/components/shared/physicalLoans/PhysicalLoans"
import ProfileNotifications, {
  ProfileNotificationsSkeleton,
} from "@/components/shared/profileNotifications/ProfileNotifications"
import UserLoans from "@/components/shared/userLoans/UserLoans"
import { getDplCmsPublicConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import getQueryClient from "@/lib/getQueryClient"
import { getBearerTokenServerSide } from "@/lib/helpers/bearer-token"
import { isBiblioAdapterActive } from "@/lib/helpers/helper.biblio"
import { getServiceLayerConfig } from "@/lib/helpers/service-layer"
import type { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { getSession } from "@/lib/session/session"

// The Publizon support ID (friendlyCardNumber) only exists in the user loans
// response, so it is prefetched here and hydrated into the query cache. Both
// publizon adapters share the "/v1/user/loans" query key, so the loan
// consumers read the result instead of fetching client-side.
const prefetchUserLoans = async (sessionType: "unilogin" | "adgangsplatformen") => {
  const queryClient = getQueryClient()
  const cookieStore = await cookies()
  const base =
    sessionType === "unilogin"
      ? `${getBaseURL()}/${goConfig("routes.pubhub")}`
      : `${getBaseURL()}/${goConfig("routes.adgangsplatformen-service-proxy")}/pubhub-adapter`

  await queryClient.prefetchQuery({
    queryKey: getGetV1UserLoansAdapterQueryKey(),
    queryFn: async () => {
      // The proxy authenticates from the session cookie, which a server-side
      // fetch doesn't carry by itself — forward it explicitly.
      const response = await fetch(`${base}/v1/user/loans`, {
        headers: { cookie: cookieStore.toString() },
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch user loans: ${response.status}`)
      }
      return response.json()
    },
  })
  return queryClient
}

// With the Biblio adapter on, the support ID comes from Biblio — the same id
// the adult site shows. A failure only hides the line, never the page.
// TODO(publizon-sunset): make this the only source of the support ID.
const getBiblioSupportId = async () => {
  const accessToken = await getBearerTokenServerSide("biblio", await cookies())
  if (!accessToken) return null
  return getDigitalSupportId(getServiceLayerConfig(accessToken)).catch(() => null)
}

const ProfilePageLayout = async () => {
  // The session is resolved server-side; Username and LogoutButton render
  // without any client session lookup.
  const session = await getSession()
  const name = session.user?.name || session.user?.username || null

  const digitalLoanSessionType =
    session.isLoggedIn && (session.type === "unilogin" || session.type === "adgangsplatformen")
      ? session.type
      : null
  const { biblio } = await getDplCmsPublicConfig()
  const viaBiblioAdapter = !!digitalLoanSessionType && isBiblioAdapterActive(biblio)

  const [queryClient, biblioSupportId] = await Promise.all([
    digitalLoanSessionType ? prefetchUserLoans(digitalLoanSessionType) : getQueryClient(),
    viaBiblioAdapter ? getBiblioSupportId() : null,
  ])

  const supportId = viaBiblioAdapter
    ? biblioSupportId
    : (queryClient.getQueryData<LoanListResult>(getGetV1UserLoansAdapterQueryKey())?.userData
        ?.friendlyCardNumber ?? null)

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="content-container grid-go w-full gap-y-10">
        <div className="col-span-full flex flex-wrap items-center gap-x-8 gap-y-6 lg:flex-nowrap">
          <div className="min-w-0 space-y-2">
            <h1 className="text-typo-subtitle-sm text-foreground-muted">Min side</h1>
            {name && <p className="text-typo-heading-2 lg:max-w-prose">{name}</p>}
            {supportId && (
              <p className="text-typo-subtitle-sm text-foreground-muted">
                {`Support ID: ${supportId}`}
              </p>
            )}
          </div>
          <LogoutButton />
        </div>
        {/* FBS-only section — skipped entirely (skeleton included) for
            sessions that can never load it. */}
        {session.type === "adgangsplatformen" && (
          <Suspense fallback={<ProfileNotificationsSkeleton />}>
            <ProfileNotifications />
          </Suspense>
        )}
        <Suspense fallback={<LoanSliderSkeleton />}>
          <UserLoans />
        </Suspense>
        <Suspense fallback={<PhysicalLoanSliderSkeleton />}>
          <PhysicalLoans />
        </Suspense>
      </div>
    </HydrationBoundary>
  )
}

export default ProfilePageLayout
