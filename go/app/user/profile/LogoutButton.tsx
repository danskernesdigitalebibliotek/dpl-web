"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import useSession from "@/hooks/useSession"

const LogoutButton = () => {
  const [logoutWasClicked, setLogoutWasClicked] = useState(false)
  const { session, isLoading } = useSession()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="bg-background-skeleton mb-grid-gap-half h-10 w-44 animate-pulse rounded-full lg:w-80" />
    )
  }

  if (!session?.isLoggedIn) {
    return null
  }

  const handleClick = () => {
    // In order to prevent double click.
    if (logoutWasClicked) {
      return
    }
    setLogoutWasClicked(true)
    router.push("/auth/logout")
  }

  return (
    <>
      <Button onClick={handleClick} ariaLabel="Log ud" disabled={logoutWasClicked}>
        <Icon className="mr-3 h-[20px] w-[20px]" name="lock" /> Log ud
      </Button>
    </>
  )
}
export default LogoutButton
