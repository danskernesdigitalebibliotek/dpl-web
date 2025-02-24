"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import useSession from "@/hooks/useSession"

const LogoutButton = () => {
  const [logoutWasClicked, setLogoutWasClicked] = useState(false)
  const session = useSession()
  const router = useRouter()

  if (!session?.session?.isLoggedIn) {
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
        Log ud
      </Button>
    </>
  )
}
export default LogoutButton
