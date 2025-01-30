"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"

const UniloginLogoutButton = () => {
  const router = useRouter()
  return (
    <>
      <Button onClick={() => router.push("/auth/logout")} ariaLabel="Log ud">
        Log ud
      </Button>
    </>
  )
}
export default UniloginLogoutButton
