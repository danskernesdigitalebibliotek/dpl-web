"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useContext } from "react"

import AdgangsplatformenLoginPanel from "@/components/shared/adgangsplatformenLoginPanel/AdgangsplatformenLoginPanel"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
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
      <div className="mx-auto w-full max-w-prose space-y-6">
        <p className="text-typo-subtitle-md">
          Du kan ikke reservere bøger på biblioteket med UNI-login.
        </p>

        <ul className="text-typo-body-md list-disc space-y-3 pl-6">
          <li>Brug dit bibliotekslogin i stedet for UNI-login.</li>
          <li>
            Hvis du ikke har et bibliotekslogin, kan du få det lavet sammen med en forælder/værge på
            dit lokale bibliotek eller på bibliotekets hjemmeside.
          </li>
        </ul>

        <AdgangsplatformenLoginPanel
          onLogin={handleLogin}
          disabled={!loginUrlAdgangsplatformen}
          description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
        />
      </div>
    </ResponsiveDialog>
  )
}

export default ReservationUniloginModal
