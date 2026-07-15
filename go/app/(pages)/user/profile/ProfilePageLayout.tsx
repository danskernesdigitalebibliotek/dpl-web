import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { cookies } from "next/headers"
import React, { Suspense } from "react"

import { LoanSliderSkeleton } from "@/app/(pages)/user/profile/LoanSlider"
import LogoutButton from "@/app/(pages)/user/profile/LogoutButton"
import { PhysicalLoanSliderSkeleton } from "@/app/(pages)/user/profile/PhysicalLoanSlider"
import PhysicalLoans from "@/app/(pages)/user/profile/PhysicalLoans"
import UserLoans from "@/app/(pages)/user/profile/UserLoans"
import { getBaseURL } from "@/lib/config/getBaseURL"
import goConfig from "@/lib/config/goConfig"
import getQueryClient from "@/lib/getQueryClient"
import type { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import { getGetV1UserLoansAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"
import { getSession } from "@/lib/session/session"

// The support ID (friendlyCardNumber) only exists in the user loans response,
// so it is prefetched here and hydrated into the query cache. Both publizon
// adapters share the "/v1/user/loans" query key, so SupportId (and the other
// loan consumers) read the result instead of fetching client-side.
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

const ProfilePageLayout = async () => {
  // The session is resolved server-side; Username and LogoutButton render
  // without any client session lookup.
  const session = await getSession()
  const name = session.user?.name || session.user?.username || null

  const queryClient =
    session.isLoggedIn && (session.type === "unilogin" || session.type === "adgangsplatformen")
      ? await prefetchUserLoans(session.type)
      : getQueryClient()

  const supportId =
    queryClient.getQueryData<LoanListResult>(getGetV1UserLoansAdapterQueryKey())?.userData
      ?.friendlyCardNumber ?? null

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
