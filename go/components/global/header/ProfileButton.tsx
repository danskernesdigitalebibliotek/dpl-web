"use client"

import { useRouter } from "next/navigation"
import React, { MouseEvent } from "react"

import { Button, buttonVariants } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/sheet/Sheet"
import useSession from "@/hooks/useSession"
import useGetDplCmsLoginUrls from "@/lib/config/dpl-cms/useGetDplCmsLoginUrls"

const HeaderButton = ({
  onClick,
  asChild = false,
}: {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  asChild?: boolean
  // TODO: Dynamic aria-label.
}) => (
  <Button onClick={onClick} variant="icon" ariaLabel="Login / Tilgå profilsiden" asChild={asChild}>
    <Icon className="h-[24px] w-[24px]" name="profile" />
  </Button>
)

function ProfileButton() {
  const { session, isLoading } = useSession()
  const router = useRouter()
  const { adgangsplatformen: adgangsplatformenLoginUrl } = useGetDplCmsLoginUrls()

  if (isLoading) {
    return (
      <>
        <HeaderButton />
      </>
    )
  }

  if (!session || !session.isLoggedIn) {
    return (
      <Sheet>
        <SheetTrigger
          aria-label="Login / Tilgå profilsiden"
          className={buttonVariants({ variant: "icon" })}>
          <Icon className="h-[24px] w-[24px]" name="profile" />
        </SheetTrigger>
        <SheetContent className="p-grid-edge grid w-full max-w-[560px] grid-rows-[min-content_1fr]">
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
            {adgangsplatformenLoginUrl && (
              <>
                <hr className="divider-go mx-auto" />
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
                      onClick={() => router.push(adgangsplatformenLoginUrl)}
                      ariaLabel="Log ind med Adgangsplatformen">
                      LOG IND
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <>
      <HeaderButton onClick={() => router.push("/user/profile")} />
    </>
  )
}

export default ProfileButton
