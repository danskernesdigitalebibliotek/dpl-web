import { usePostV1UserLoansIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { withSessionType } from "@/lib/rest/publizon/helper"
import { usePostV1UserLoansIdentifierLocalAdapter } from "@/lib/rest/publizon/local-adapter/generated/publizon"
import { TSessionType } from "@/lib/types/session"

const usePostV1UserLoansIdentifier = withSessionType((cookieType: TSessionType) => {
  if (cookieType === "unilogin") {
    return usePostV1UserLoansIdentifierLocalAdapter()
  }
  return usePostV1UserLoansIdentifierAdapter()
})

export default usePostV1UserLoansIdentifier
