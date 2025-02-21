"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import useSession from "@/hooks/useSession"

const LogoutButton = () => {
  const session = useSession()
  const router = useRouter()

  if (!session?.session?.isLoggedIn) {
    return null
  }

  return (
    <>
      <Button onClick={() => router.push("/auth/logout")} ariaLabel="Log ud">
        Log ud
      </Button>
    </>
  )
}
export default LogoutButton
