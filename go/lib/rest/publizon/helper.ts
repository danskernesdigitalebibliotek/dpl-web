import { getCookie } from "cookies-next/client"

import { TSessionType } from "@/lib/types/session"

export const withSessionType = <Args extends unknown[], Return>(
  fn: (sessionType: TSessionType, ...args: Args) => Return
): ((...args: Args) => Return) => {
  return (...args) => {
    const cookieType = getCookie("go-session:type") as TSessionType | undefined
    return fn(cookieType ?? "anonymous", ...args)
  }
}
