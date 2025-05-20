import { redirect } from "next/navigation"
import React, { Suspense } from "react"

import { LoanSliderSkeleton } from "@/app/(pages)/user/profile/LoanSlider"
import LogoutButton from "@/app/(pages)/user/profile/LogoutButton"
import UserLoans from "@/app/(pages)/user/profile/UserLoans"
import { ButtonSkeleton } from "@/components/shared/button/Button"
import { userIsAnonymous } from "@/lib/helpers/user"
import { getSession } from "@/lib/session/session"

import DebuggingSession from "./DebuggingSession"
import SupportId, { SupportIdSkeleton } from "./SupportId"
import Username, { UsernameSkeleton } from "./Username"

const ProfilePageLayout = async () => {
  const session = await getSession()

  // @todo Would be better to solve this in the middleware.
  if (userIsAnonymous(session)) {
    redirect("/")
  }

  return (
    <div className="content-container grid-go -mt-space-y w-full space-y-3">
      <div className="col-span-full flex flex-row flex-wrap">
        <h1 className="text-typo-subtitle-sm text-foreground/50 mb-5 lg:w-full">Min side</h1>
        <Suspense fallback={<ButtonSkeleton size="sm" />}>
          <LogoutButton />
        </Suspense>
        <Suspense fallback={<UsernameSkeleton />}>
          <Username />
        </Suspense>
      </div>
      <Suspense fallback={<SupportIdSkeleton />}>
        <SupportId />
      </Suspense>
      <Suspense fallback={<LoanSliderSkeleton />}>
        <UserLoans />
      </Suspense>
      <DebuggingSession hideInProduction />
    </div>
  )
}

export default ProfilePageLayout
