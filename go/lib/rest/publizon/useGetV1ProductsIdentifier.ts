import { withSessionType } from "@/lib/rest/publizon/helper"
import { TSessionType } from "@/lib/types/session"

import { useGetV1ProductsIdentifierAdapter } from "./adapter/generated/publizon"
import { useGetV1ProductsIdentifierLocalAdapter } from "./local-adapter/generated/publizon"

const useGetV1ProductsIdentifier = withSessionType(
  (cookieType: TSessionType, identifier: string) => {
    if (cookieType === "unilogin") {
      return useGetV1ProductsIdentifierLocalAdapter(identifier, { enabled: !!identifier })
    }
    return useGetV1ProductsIdentifierAdapter(identifier, { enabled: !!identifier })
  }
)

export default useGetV1ProductsIdentifier
