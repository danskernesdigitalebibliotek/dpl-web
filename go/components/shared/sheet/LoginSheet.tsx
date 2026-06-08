"use client"

import { useRouter } from "next/navigation"
import React, { useContext } from "react"

import LoginPanel from "@/components/shared/loginPanel/LoginPanel"
import { cyKeys } from "@/cypress/support/constants"
import routes from "@/lib/config/resolvers/routes"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"
import { sheetStore } from "@/store/sheet.store"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet"

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
    <Sheet open={open} onOpenChange={(open: boolean) => (open ? null : closeSheet())}>
      <SheetContent className="grid grid-rows-[min-content_1fr]">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-typo-heading-3">Log ind</SheetTitle>
        </SheetHeader>
        <SheetDescription asChild>
          <div className="flex h-full flex-col justify-center space-y-8">
            <LoginPanel
              heading="Log ind med UNI•Login"
              ariaLabel="Log ind med UNI•Login"
              onLogin={handleUniLogin}
              dataCy={cyKeys["login-sheet-unilogin-button"]}
            />
            <hr className="mx-auto" />
            <LoginPanel
              icon="adgangsplatformen"
              heading="Login med dit bibliotekslogin"
              ariaLabel="Log ind med bibliotekslogin"
              onLogin={handleAdgangsplatformenLogin}
              disabled={!loginUrlAdgangsplatformen}
              dataCy={cyKeys["login-sheet-adgangsplatformen-button"]}
              description="Med bibliotekslogin kan du låne e-bøger, lydbøger og podcasts. Du kan også reservere og låne fysiske bøger på dit lokale bibliotek."
            />
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  )
}

export default LoginSheet
