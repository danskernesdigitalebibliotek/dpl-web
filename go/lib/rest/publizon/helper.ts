import { getCookie } from "cookies-next/client"

import { TSessionType } from "@/lib/types/session"

export const withSessionType = <T extends (sessionType: TSessionType) => ReturnType<T>>(fn: T) => {
  return () => {
    const cookieType = getCookie("go-session:type") as TSessionType | undefined
    return fn(cookieType ?? "anonymous")
  }
}
