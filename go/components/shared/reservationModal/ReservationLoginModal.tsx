"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useContext } from "react"

import LoginPanel from "@/components/shared/loginPanel/LoginPanel"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import { setLoginRedirectCookie } from "@/lib/helpers/login-redirect"
import { createModalUrl } from "@/lib/helpers/modal-url"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

type ReservationLoginModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const ReservationLoginModal = ({ open, onClose, wid, pid }: ReservationLoginModalProps) => {
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
    <ResponsiveDialog open={open} onClose={onClose} title="Reserver bog">
      <div
        className="mx-auto w-full max-w-prose space-y-6"
        data-cy={cyKeys["reservation-login-modal"]}>
        <h5 className="text-typo-heading-5 text-pretty!">
          4 nemme steps til lån af bog på biblioteket.
        </h5>

        <ol className="text-typo-subtitle-md text-foreground-muted ordered-list space-y-3">
          <li>
            For at låne en fysisk bog skal du logge ind med et bibliotekslogin (ikke Unilogin).
          </li>
          <li>Tryk på Reserver bog.</li>
          <li>Du får besked, når bogen kan hentes.</li>
          <li>Hent bogen på dit bibliotek.</li>
        </ol>

        <LoginPanel
          icon="adgangsplatformen"
          heading="Log ind med dit bibliotekslogin"
          ariaLabel="Log ind med bibliotekslogin"
          onLogin={handleLogin}
          disabled={!loginUrlAdgangsplatformen}
          description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
        />

        <p className="text-typo-body-sm text-foreground-muted text-center">
          Bemærk! Hvis du oplever at blive logget ud, lige efter at du er logget ind, modtager vi
          ikke info om din kommune. Læs mere om problemer ved log ind i vores FAQ.
        </p>
      </div>
    </ResponsiveDialog>
  )
}

export default ReservationLoginModal
