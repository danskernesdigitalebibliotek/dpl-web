"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import ButtonWithLoadingStateHoc from "@/components/shared/button/ButtonWithLoadingStateHoc"
import { cyKeys } from "@/cypress/support/constants"

type LogoutButtonProps = {
  onClick?: () => void
}
const className = "ml-auto w-full min-w-40 lg:order-2 lg:w-auto"
const size = "sm"

// Rendered by the profile page, which already resolved the session
// server-side — no client session lookup needed.
const LogoutButton = ({ onClick }: LogoutButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    router.push("/auth/logout")
  }

  return (
    <Button
      variant="icon-text"
      icon="lock"
      size={size}
      ariaLabel="Log ud"
      onClick={handleClick}
      className={className}
      data-cy={cyKeys["logout-button"]}>
      Log ud
    </Button>
  )
}
export default ButtonWithLoadingStateHoc(LogoutButton, { className, size })
