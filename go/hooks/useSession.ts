import { useEffect, useState } from "react"

import { TSessionData } from "@/lib/session/session"

const fetchSession = async ({
  setSessionHandler,
  setLoadingHandler,
}: {
  setLoadingHandler: (isLoading: boolean) => void
  setSessionHandler: (session: TSessionData | null) => void
}) => {
  try {
    const response = await fetch("/auth/session")
    if (response.ok) {
      const session = (await response.json()) as TSessionData
      setSessionHandler(session)
    }
  } finally {
    setLoadingHandler(false)
  }
}

export default function useSession() {
  const [session, setSession] = useState<TSessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSession({
      setSessionHandler: setSession,
      setLoadingHandler: setIsLoading,
    })
  }, [session?.isLoggedIn, session?.access_token])
  return { session, isLoading }
}
