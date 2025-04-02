import React, { Suspense } from "react"

import DebuggingSession from "@/app/user/profile/DebuggingSession"
import LoanList from "@/app/user/profile/LoanList"
import { LoanListSliderSkeleton } from "@/app/user/profile/LoanListSlider"
import LogoutButton from "@/app/user/profile/LogoutButton"
import { ButtonSkeleton } from "@/components/shared/button/Button"

const ProfilePageLayout = () => {
  return (
    <div className="content-container grid-go -mt-space-y w-full space-y-3">
      <div className="col-span-full flex flex-row flex-wrap">
        <h1 className="text-typo-subtitle-sm mb-5 lg:w-full">Profile</h1>
        <Suspense fallback={<ButtonSkeleton size="sm" />}>
          <LogoutButton className="ml-auto justify-end lg:order-2" />
        </Suspense>
        <p className="text-typo-heading-2 mt-6 w-full pb-5 lg:order-1 lg:mt-0 lg:w-auto lg:max-w-[80%]">
          Username / User Name
        </p>
      </div>
      <LoanList />
      <DebuggingSession />
    </div>
  )
}

export const ProfilePageLayoutSkeleton = () => {
  return (
    <div className="content-container grid-go -mt-space-y w-full space-y-3">
      <div className="col-span-full flex flex-row flex-wrap">
        <h1 className="text-typo-subtitle-sm mb-5 lg:w-full">Profile</h1>
        <ButtonSkeleton size="sm" className="ml-auto justify-end lg:order-2" />
        {/* username skeleton */}
        <div
          className="text-typo-heading-2 bg-background-skeleton h-[46px] w-full animate-pulse rounded-sm lg:h-[66px]
            lg:w-96"
        />
      </div>
      <div className="col-span-full">
        <LoanListSliderSkeleton />
      </div>
    </div>
  )
}

export default ProfilePageLayout
