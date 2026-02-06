"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import ButtonWithLoadingStateHoc from "@/components/shared/button/ButtonWithLoadingStateHoc"
import Icon from "@/components/shared/icon/Icon"
import { cyKeys } from "@/cypress/support/constants"
import useSession from "@/hooks/useSession"

export const LogoutButtonSkeleton = () => (
  <div
    className={`bg-background-skeleton mb-grid-gap-half ml-auto h-8 w-44 animate-pulse justify-end
      rounded-full lg:order-2`}
  />
)

type LogoutButtonProps = {
  onClick?: () => void
}
const className = "ml-auto lg:order-2 min-w-40"
const size = "sm"

const LogoutButton = ({ onClick }: LogoutButtonProps) => {
  const { isLoading: sessionIsLoading } = useSession()
  const router = useRouter()

  if (sessionIsLoading) {
    return <LogoutButtonSkeleton />
  }

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    router.push("/auth/logout")
  }

  return (
    <>
      <Button
        size={size}
        onClick={handleClick}
        className={className}
        data-cy={cyKeys["logout-button"]}>
        <Icon className="mr-3 h-[20px] w-[20px]" name="lock" />
        Log ud
      </Button>
    </>
  )
}
export default ButtonWithLoadingStateHoc(LogoutButton, { className, size })
