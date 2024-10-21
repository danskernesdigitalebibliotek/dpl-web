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
} from "@/components/shared/sheet/Sheet"
import useSession from "@/hooks/useSession"

const HeaderButton = ({ onClick }: { onClick?: (e: MouseEvent<HTMLButtonElement>) => void }) => (
  <Button onClick={onClick} variant="icon">
    <Icon className="h-[24px] w-[24px]" name="profile" />
  </Button>
)

function ProfileButton() {
  const { session, loading } = useSession()
  const router = useRouter()
  if (loading) {
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
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="text-typo-heading-4">Log ind</SheetTitle>
            <div className="flex flex-col items-center justify-center rounded-sm bg-background-overlay p-10">
              <SheetDescription className="text-typo-heading-6 mb-2 font-bold text-black">
                Log ind med UNI•Login
              </SheetDescription>
              <div>
                <Button
                  className="size-sm bg-black text-stone-100 outline"
                  size="sm"
                  onClick={() => router.push("/auth/login/unilogin")}>
                  log ind
                </Button>
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
