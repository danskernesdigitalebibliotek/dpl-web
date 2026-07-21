"use client"

import { useRouter } from "next/navigation"
import React, { useContext } from "react"

import LoginPanel from "@/components/shared/loginPanel/LoginPanel"
import PhysicalLoanSlider from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import { cn } from "@/lib/helpers/helper.cn"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// Unilogin sessions cannot see FBS loans or reservations. Instead of hiding
// the section, tease what a library login unlocks: the normal (empty)
// section dimmed and inert behind a centered login card.
const PhysicalLoansUniloginTeaser = ({ className }: { className?: string }) => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const loginUrlAdgangsplatformen = dplCmsConfig?.loginUrls?.adgangsplatformen
  const router = useRouter()

  return (
    <div className={cn("relative col-span-full", className)}>
      <div className="opacity-40 select-none" aria-hidden inert>
        <PhysicalLoanSlider items={[]} reservationItems={[]} />
      </div>
      <div className="p-grid-edge absolute inset-0 flex items-start justify-center pt-24">
        <div
          className="bg-background rounded-base p-grid-edge w-full max-w-xl space-y-6 shadow-xl
            md:p-8">
          <p className="text-typo-subtitle-md text-center">
            Du kan ikke se bøger du har lånt eller reserveret på biblioteket, når du er logget ind
            med UNI-login.
          </p>
          <LoginPanel
            icon="adgangsplatformen"
            heading="Log ind med dit bibliotekslogin"
            ariaLabel="Log ind med dit bibliotekslogin"
            onLogin={() => router.push(loginUrlAdgangsplatformen ?? "/")}
            disabled={!loginUrlAdgangsplatformen}
            description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
          />
        </div>
      </div>
    </div>
  )
}

export default PhysicalLoansUniloginTeaser
