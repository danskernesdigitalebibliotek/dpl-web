"use client"

import { useRouter } from "next/navigation"
import React, { MouseEvent } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/shared/sheet/LoginSheet"
import useSession from "@/hooks/useSession"

const HeaderButton = ({
  onClick,
  asChild = false,
}: {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  asChild?: boolean
  // TODO: Dynamic aria-label.
}) => (
  <Button onClick={onClick} variant="icon" aria-label="Login / Tilgå profilsiden" asChild={asChild}>
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
        <SheetTrigger>
          <HeaderButton />
        </SheetTrigger>
        <SheetContent className="p-grid-edge w-full max-w-[560px]">
          <SheetHeader>
            <SheetTitle className="mb-space-y text-typo-heading-3">Log ind</SheetTitle>
            <div className="py-space-y flex flex-col items-center justify-center rounded-sm bg-background-overlay">
              <SheetDescription className="mb-4 text-typo-heading-4 font-bold text-foreground">
                Log ind med UNI•Login
              </SheetDescription>
              <div>
                <Button onClick={() => router.push("/auth/login/unilogin")}>LOG IND</Button>
              </div>
            </div>
          </SheetHeader>
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
