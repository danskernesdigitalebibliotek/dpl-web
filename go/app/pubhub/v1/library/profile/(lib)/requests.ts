import { getPublizonServiceParameters } from "@/lib/helpers/publizon"
import { createClientAsync as createClientAsyncGetLibraryProfile } from "@/lib/soap/publizon/v2_7/generated/getlibraryinfo"

import { TGetLibraryProfile } from "./types"

export const getLibraryProfileRequest = async () => {
  const client = await createClientAsyncGetLibraryProfile(
    "./lib/soap/publizon/v2_7/wsdl/getlibraryinfo.wsdl"
  )

  const [response] = await client.GetLibraryProfileAsync({
    ...getPublizonServiceParameters(),
  })
  return response.GetLibraryProfileResult as TGetLibraryProfile
}
