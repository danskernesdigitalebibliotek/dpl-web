"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import React, { useContext } from "react"

import { getManifestationLabel } from "@/components/pages/workPageLayout/helper"
import LoginPanel from "@/components/shared/loginPanel/LoginPanel"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { cyKeys } from "@/cypress/support/constants"
import routes from "@/lib/config/resolvers/routes"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"
import { findManifestationByPid } from "@/lib/helpers/helper.manifestation"
import { setLoginRedirectCookie } from "@/lib/helpers/login-redirect"
import { createModalUrl } from "@/lib/helpers/modal-url"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

type LoanLoginModalProps = {
  open: boolean
  onClose: () => void
  wid: string
  pid: string
}

const LoanLoginModal = ({ open, onClose, wid, pid }: LoanLoginModalProps) => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const loginUrlAdgangsplatformen = dplCmsConfig?.loginUrls?.adgangsplatformen
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const manifestation = findManifestationByPid(data?.work, pid)
  const label = manifestation ? getManifestationLabel(manifestation) : ""

  const redirectAfterLogin = () => {
    const redirectPath = createModalUrl(`${pathname}?${searchParams}`, {
      modal: "LoanMaterialModal",
      modalProps: { wid, pid },
    })
    setLoginRedirectCookie(redirectPath)
  }

  const handleUniLogin = () => {
    redirectAfterLogin()
    router.push(routes["routes.login.unilogin"])
  }

  const handleAdgangsplatformenLogin = () => {
    redirectAfterLogin()
    if (loginUrlAdgangsplatformen) {
      router.push(loginUrlAdgangsplatformen)
    }
  }

  return (
    <ResponsiveDialog open={open} onClose={onClose} title="Log ind">
      <div className="mx-auto w-full max-w-prose space-y-8" data-cy={cyKeys["loan-login-modal"]}>
        <div className="space-y-4">
          <p className="text-typo-heading-5">Du skal logge ind for at låne {label}</p>
          <p className="text-typo-subtitle-md text-foreground-muted">
            Brug dit bibliotekslogin eller dit Unilogin for at komme videre.
          </p>
        </div>

        <LoginPanel
          heading="Log ind med UNI•Login"
          ariaLabel="Log ind med UNILogin"
          onLogin={handleUniLogin}
          dataCy={cyKeys["loan-login-modal-unilogin-button"]}
          description="Med UNILogin kan du låne e-bøger, lydbøger og podcasts."
        />

        <LoginPanel
          icon="adgangsplatformen"
          heading="Log ind med dit bibliotekslogin"
          ariaLabel="Log ind med bibliotekslogin"
          onLogin={handleAdgangsplatformenLogin}
          disabled={!loginUrlAdgangsplatformen}
          dataCy={cyKeys["loan-login-modal-adgangsplatformen-button"]}
          description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
        />
      </div>
    </ResponsiveDialog>
  )
}

export default LoanLoginModal
