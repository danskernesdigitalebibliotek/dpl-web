import { useGetV1LibraryProfileAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { withSessionType } from "@/lib/rest/publizon/helper"
import { useGetV1LibraryProfileLocalAdapter } from "@/lib/rest/publizon/local-adapter/generated/publizon"
import { AuthenticationMethod } from "@/lib/session/definitions"

const useGetV1LibraryProfile = withSessionType((cookieType: AuthenticationMethod) => {
  if (cookieType === "unilogin") {
    return useGetV1LibraryProfileLocalAdapter()
  }
  return useGetV1LibraryProfileAdapter()
})

export default useGetV1LibraryProfile
