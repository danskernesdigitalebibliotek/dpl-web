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
        <SheetContent className="grid w-full max-w-[560px] grid-rows-[min-content,1fr] p-grid-edge">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-typo-heading-3">Log ind</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col justify-center space-y-8">
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-sm bg-background-overlay py-space-y">
              <SheetDescription className="mb-4 text-typo-heading-4 text-foreground">
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
            <hr className="mx-auto w-full border-foreground opacity-10 md:w-full" />
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-sm bg-background-overlay py-space-y">
              <div className="mb-4">
                <Icon name="adgangsplatformen" />
              </div>
              <SheetDescription className="text-typo-heading-4 text-foreground">
                Login via Biblotekernes
              </SheetDescription>
              <SheetDescription className="mb-4 text-typo-heading-4 text-foreground">
                fælles loginside
              </SheetDescription>
              <div>
                <Button
                  theme="primary"
                  onClick={() =>
                    router.push(`https://dapple-cms.docker/login?current-path=/go-login`)
                  }
                  ariaLabel="Log ind med Adgangsplatformen">
                  LOG IND
                </Button>
              </div>
            </div>
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
