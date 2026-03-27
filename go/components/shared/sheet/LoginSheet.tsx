"use client"

import { useRouter } from "next/navigation"
import React, { useContext } from "react"

import { cyKeys } from "@/cypress/support/constants"
import routes from "@/lib/config/resolvers/routes"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"
import { sheetStore } from "@/store/sheet.store"

import { Button } from "../button/Button"
import Icon from "../icon/Icon"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet"

function LoginSheet({ open, onLogin }: { open: boolean; onLogin?: () => void }) {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const loginUrlAdgangsplatformen = dplCmsConfig?.loginUrls?.adgangsplatformen
  const { closeSheet } = sheetStore.trigger
  const router = useRouter()

  return (
    <Sheet open={open} onOpenChange={(open: boolean) => (open ? null : closeSheet())}>
      <SheetContent className="grid grid-rows-[min-content_1fr]">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-typo-heading-3">Log ind</SheetTitle>
        </SheetHeader>
        <SheetDescription asChild>
          <div className="flex h-full flex-col justify-center space-y-8">
            <div
              className="bg-background-overlay flex min-h-[300px] flex-col items-center
                justify-center rounded-sm p-8">
              <div className="text-typo-heading-4 text-foreground mb-4 text-center">
                Log ind med UNI•Login
              </div>
              <div>
                <Button
                  theme="primary"
                  ariaLabel="Log ind"
                  onClick={() => {
                    if (onLogin) onLogin()
                    router.push(routes["routes.login.unilogin"])
                  }}
                  data-cy={cyKeys["login-sheet-unilogin-button"]}>
                  LOG IND
                </Button>
              </div>
            </div>
            <>
              <hr className="mx-auto" />
              <div
                className="bg-background-overlay flex min-h-[300px] flex-col items-center
                  justify-center rounded-sm p-8">
                <div className="mb-4">
                  <Icon name="adgangsplatformen" />
                </div>
                <div className="text-typo-heading-4 text-foreground mb-4 text-center">
                  Login med dit bibliotekslogin
                </div>
                <div>
                  <Button
                    theme="primary"
                    ariaLabel="Log ind"
                    onClick={() => {
                      if (onLogin) onLogin()
                      router.push(loginUrlAdgangsplatformen ?? "")
                    }}
                    disabled={!loginUrlAdgangsplatformen}
                    data-cy={cyKeys["login-sheet-adgangsplatformen-button"]}>
                    LOG IND
                  </Button>
                </div>
              </div>
            </>
          </div>
        </SheetDescription>
      </SheetContent>
    </Sheet>
  )
}

export default LoginSheet
