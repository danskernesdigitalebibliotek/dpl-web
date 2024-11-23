"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/shared/button/Button"
import useSession from "@/hooks/useSession"

const LogoutButton = () => {
  const router = useRouter()
  const session = useSession()

  return (
    <>
      <Button onClick={() => router.push("/auth/logout")} ariaLabel="Log ud">
        Log ud
      </Button>
      <h2 className="mt-5 text-typo-heading-5">Debugging:</h2>
      <div className="mt-3">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </>
  )
}

export default LogoutButton
