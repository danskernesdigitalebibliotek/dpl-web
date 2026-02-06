"use client"

import { useRouter } from "next/navigation"
import React from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import { cyKeys } from "@/cypress/support/constants"
import useSession from "@/hooks/useSession"
import { userIsAnonymous } from "@/lib/helpers/user"
import { sheetStore } from "@/store/sheet.store"

function ProfileButton() {
  const { session } = useSession()
  const router = useRouter()

  const { openSheet } = sheetStore.trigger

  const handleOnClick = () => {
    if (userIsAnonymous(session)) {
      openSheet({
        sheetType: "LoginSheet",
      })
    } else {
      router.push("/user/profile")
    }
  }

  return (
    <Button
      aria-label={userIsAnonymous(session) ? "Login" : "Tilgå profilsiden"}
      variant="icon"
      onClick={() => handleOnClick()}
      data-cy={cyKeys["profile-button"]}>
      <Icon className="h-[24px] w-[24px]" name="profile" />
    </Button>
  )
}

export default ProfileButton
