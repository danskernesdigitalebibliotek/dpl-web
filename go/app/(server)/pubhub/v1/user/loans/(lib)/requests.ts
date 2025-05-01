import { TUserInfo } from "@/app/pubhub/(lib)/types"
import { getPublizonServiceParameters } from "@/lib/helpers/publizon"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

import { TLibraryUserOrderList } from "./types"

export const getLibraryUserOrderListRequest = async (uniLoginUserInfo: TUserInfo) => {
  const client = await createClientAsync(
    "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
  )
  const [response] = await client.GetLibraryUserOrderListAsync({
    ...getPublizonServiceParameters(),
    cardnumber: uniLoginUserInfo.uniid,
  })
  return response.GetLibraryUserOrderListResult as TLibraryUserOrderList
}
