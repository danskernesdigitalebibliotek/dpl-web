"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"

type LogoutButtonProps = {
  onClick?: () => void
}

// Rendered by the profile page, which already resolved the session
// server-side — no client session lookup needed. The loading state covers
// the logout round trip and guards against double clicks.
const LogoutButton = ({ onClick }: LogoutButtonProps) => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleClick = () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    onClick?.()
    router.push("/auth/logout")
  }

  return (
    <Button
      variant="icon-text"
      icon="lock"
      size="sm"
      ariaLabel="Log ud"
      isLoading={isLoggingOut}
      onClick={handleClick}
      className="ml-auto w-full min-w-40 lg:order-2 lg:w-auto"
      data-cy={cyKeys["logout-button"]}>
      Log ud
    </Button>
  )
}

export default LogoutButton
