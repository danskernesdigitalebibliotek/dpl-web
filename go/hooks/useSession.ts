"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { loadSession } from "@/lib/session/fetchSession"
import { TSessionData } from "@/lib/session/session"

const fetchSession = async ({
  setSessionHandler,
  setLoadingHandler,
}: {
  setLoadingHandler: (isLoading: boolean) => void
  setSessionHandler: (session: TSessionData | null) => void
}) => {
  try {
    const session = await loadSession()
    if (session) {
      setSessionHandler(session)
    }
  } finally {
    setLoadingHandler(false)
  }
}

export default function useSession() {
  const [session, setSession] = useState<TSessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const reloadSession = Boolean(searchParams.get("reload-session"))

  useEffect(() => {
    fetchSession({
      setSessionHandler: setSession,
      setLoadingHandler: setIsLoading,
    })

    if (reloadSession) {
      const params = new URLSearchParams(searchParams)
      params.delete("reload-session")
      router.replace(`${pathname}?${params.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadSession])

  return { session, isLoading }
}
