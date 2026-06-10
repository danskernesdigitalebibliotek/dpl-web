import { useGetV1UserLoansAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { withSessionType } from "@/lib/rest/publizon/helper"
import { useGetV1UserLoansLocalAdapter } from "@/lib/rest/publizon/local-adapter/generated/publizon"
import { AuthenticationMethod } from "@/lib/session/definitions"

const useGetV1UserLoans = withSessionType((cookieType: AuthenticationMethod) => {
  if (cookieType === "unilogin") {
    return useGetV1UserLoansLocalAdapter()
  }
  return useGetV1UserLoansAdapter()
})

export default useGetV1UserLoans
