import { useRouter } from "next/navigation"
import React from "react"

import useGetDplCmsLoginUrls from "@/lib/config/dpl-cms/useGetDplCmsLoginUrls"
import { useSheetStore } from "@/store/sheet.store"

import { Button } from "../button/Button"
import Icon from "../icon/Icon"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet"

function LoginSheet({ open }: { open: boolean }) {
  const { adgangsplatformen: adgangsplatformenLoginUrl } = useGetDplCmsLoginUrls()
  const router = useRouter()
  const sheetStore = useSheetStore()

  return (
    <Sheet open={open} onOpenChange={(open: boolean) => (open ? null : sheetStore.closeSheet())}>
      <SheetContent className="grid w-full max-w-[560px] grid-rows-[min-content_1fr] p-8">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-typo-heading-3">Log ind</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col justify-center space-y-8">
          <div className="bg-background-overlay flex min-h-[300px] flex-col items-center justify-center rounded-sm p-8">
            <SheetDescription className="text-typo-heading-4 text-foreground mb-4 text-center">
              Log ind med UNI•Login
            </SheetDescription>
            <div>
              <Button
                theme="primary"
                onClick={() => router.push("/auth/login/unilogin")}
                ariaLabel="Log ind">
                LOG IND
              </Button>
            </div>
          </div>

          <>
            <hr className="mx-auto" />
            <div className="bg-background-overlay flex min-h-[300px] flex-col items-center justify-center rounded-sm p-8">
              <div className="mb-4">
                <Icon name="adgangsplatformen" />
              </div>
              <SheetDescription className="text-typo-heading-4 text-foreground mb-4 text-center">
                Login via Biblotekernes fælles loginside
              </SheetDescription>
              <div>
                <Button
                  theme="primary"
                  onClick={() => router.push(adgangsplatformenLoginUrl || "")}
                  ariaLabel="Log ind med Adgangsplatformen">
                  LOG IND
                </Button>
              </div>
            </div>
          </>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default LoginSheet
