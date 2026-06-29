"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useContext } from "react"

import LoginPanel from "@/components/shared/loginPanel/LoginPanel"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { setLoginRedirectCookie } from "@/lib/helpers/login-redirect"
import { createModalUrl } from "@/lib/helpers/modal-url"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

type ReservationUniloginModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const ReservationUniloginModal = ({ open, onClose, wid, pid }: ReservationUniloginModalProps) => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const loginUrlAdgangsplatformen = dplCmsConfig?.loginUrls?.adgangsplatformen
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleLogin = () => {
    const redirectPath = createModalUrl(`${pathname}?${searchParams}`, {
      modal: "ReservationModal",
      modalProps: { wid, pid },
    })
    setLoginRedirectCookie(redirectPath)
    if (loginUrlAdgangsplatformen) {
      router.push(loginUrlAdgangsplatformen)
    }
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Brug bibliotekslogin">
      <div
        className="mx-auto w-full max-w-prose space-y-6"
        data-cy={cyKeys["reservation-unilogin-modal"]}>
        <p className="text-typo-heading-5">
          Du kan ikke reservere bøger på biblioteket med Unilogin.
        </p>

        <ul className="text-typo-subtitle-md text-foreground-muted unordered-list space-y-3">
          <li>Brug dit bibliotekslogin i stedet for Unilogin.</li>
          <li>
            Hvis du ikke har et bibliotekslogin, kan du få det lavet sammen med en forælder/værge på
            dit lokale bibliotek eller på bibliotekets hjemmeside.
          </li>
        </ul>

        <LoginPanel
          icon="adgangsplatformen"
          heading="Log ind med dit bibliotekslogin"
          ariaLabel="Log ind med bibliotekslogin"
          onLogin={handleLogin}
          disabled={!loginUrlAdgangsplatformen}
          description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
        />
      </div>
    </ResponsiveDialog>
  )
}

export default ReservationUniloginModal
