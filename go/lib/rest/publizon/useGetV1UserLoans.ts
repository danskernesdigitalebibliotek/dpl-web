import { getCookie } from "cookies-next/client"

import { useGetV1UserLoansAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { useGetV1UserLoansLocalAdapter } from "@/lib/rest/publizon/local-adapter/generated/publizon"
import { TSessionType } from "@/lib/types/session"

export const withSessionType = <T extends (sessionType: TSessionType) => ReturnType<T>>(fn: T) => {
  return () => {
    const cookieType = getCookie("go-session:type") as TSessionType | undefined
    return fn(cookieType ?? "anonymous")
  }
}

const useGetV1UserLoans = withSessionType((cookieType: TSessionType) => {
  if (cookieType === "unilogin") {
    return useGetV1UserLoansLocalAdapter
  }
  return useGetV1UserLoansAdapter
})

export default useGetV1UserLoans
