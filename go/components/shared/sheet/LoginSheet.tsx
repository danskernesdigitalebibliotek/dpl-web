"use client"

import { useRouter } from "next/navigation"
import React, { useContext } from "react"

import LoginPanel from "@/components/shared/loginPanel/LoginPanel"
import ResponsiveSheet from "@/components/shared/responsiveSheet/ResponsiveSheet"
import { cyKeys } from "@/cypress/support/constants"
import routes from "@/lib/config/resolvers/routes"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"
import { sheetStore } from "@/store/sheet.store"

function LoginSheet({ open, onLogin }: { open: boolean; onLogin?: () => void }) {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const loginUrlAdgangsplatformen = dplCmsConfig?.loginUrls?.adgangsplatformen
  const { closeSheet } = sheetStore.trigger
  const router = useRouter()

  const handleUniLogin = () => {
    if (onLogin) onLogin()
    router.push(routes["routes.login.unilogin"])
  }

  const handleAdgangsplatformenLogin = () => {
    if (onLogin) onLogin()
    router.push(loginUrlAdgangsplatformen ?? "/")
  }

  return (
    <ResponsiveSheet open={open} onClose={closeSheet} title="Log ind">
      <div className="flex h-full flex-col justify-center space-y-8">
        <LoginPanel
          heading="Log ind med UNILogin"
          ariaLabel="Log ind med UNILogin"
          onLogin={handleUniLogin}
          dataCy={cyKeys["login-sheet-unilogin-button"]}
          description="Med UNILogin kan du låne e-bøger, lydbøger og podcasts."
        />
        <LoginPanel
          icon="adgangsplatformen"
          heading="Login med dit bibliotekslogin"
          ariaLabel="Log ind med dit bibliotekslogin"
          onLogin={handleAdgangsplatformenLogin}
          disabled={!loginUrlAdgangsplatformen}
          dataCy={cyKeys["login-sheet-adgangsplatformen-button"]}
          description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
        />
      </div>
    </ResponsiveSheet>
  )
}

export default LoginSheet
