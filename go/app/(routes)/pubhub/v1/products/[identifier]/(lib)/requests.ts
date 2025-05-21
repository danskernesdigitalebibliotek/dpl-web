import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"
import { getPublizonServiceParameters } from "@/lib/helpers/publizon"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getproduct"

import { TGetProducts } from "./types"

export const getProductsRequest = async (uniLoginUserInfo: TUserInfo, identifier: string) => {
  const client = await createClientAsync("./lib/soap/publizon/v2_7/wsdl/getproduct.wsdl")
  const institutionid = uniLoginUserInfo.institution_ids[0]
  if (!institutionid) {
    throw new Error("Institution id not found")
  }
  const publizonServiceParameters = await getPublizonServiceParameters()

  const [response] = await client.GetProductAsync({
    ...publizonServiceParameters,
    ebookid: identifier,
  })

  return response.GetProductResult as TGetProducts
}
