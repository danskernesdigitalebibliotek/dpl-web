"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import useSession from "@/hooks/useSession"
import { userIsAnonymous } from "@/lib/helpers/user"

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

  if (userIsAnonymous(session)) {
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
      <Button size={"sm"} onClick={handleClick} className={className} disabled={logoutWasClicked}>
        <Icon className="mr-3 h-[20px] w-[20px]" name="lock" />
        {!logoutWasClicked && <p>Log ud</p>}
        {logoutWasClicked && (
          <Icon
            name="go-spinner"
            ariaLabel="Indlæser"
            className="animate-spin-reverse mx-6 h-[15px] w-[15px]"
          />
        )}
      </Button>
    </>
  )
}
export default LogoutButton
