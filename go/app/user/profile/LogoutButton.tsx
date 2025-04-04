"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import useSession from "@/hooks/useSession"

export const LogoutButtonSkeleton = () => (
  <div
    className={`bg-background-skeleton mb-grid-gap-half ml-auto h-8 w-44 animate-pulse justify-end rounded-full
      lg:order-2`}
  />
)

export type LogoutButtonProps = {
  className?: string
}

const LogoutButton = ({ className }: LogoutButtonProps) => {
  const [logoutWasClicked, setLogoutWasClicked] = useState(false)
  const { session, isLoading } = useSession()
  const router = useRouter()

  if (isLoading) {
    return <LogoutButtonSkeleton />
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
      <Button
        size={"sm"}
        onClick={handleClick}
        className={className}
        disabled={logoutWasClicked}
        isLoading={logoutWasClicked}>
        <>
          <Icon className="mr-3 h-[20px] w-[20px]" name="lock" />
          <p>Log ud</p>
        </>
      </Button>
    </>
  )
}
export default LogoutButton
