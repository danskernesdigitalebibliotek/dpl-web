import { getPublizonServiceParameters } from "@/app/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/pubhub/(lib)/types"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

import { TLibraryUserOrderList } from "./types"

export const getLibraryUserOrderListRequest = async (userInfo: TUserInfo) => {
  const client = await createClientAsync(
    "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
  )
  const [response] = await client.GetLibraryUserOrderListAsync({
    ...getPublizonServiceParameters(),
    cardnumber: userInfo.uniid,
  })
  return response.GetLibraryUserOrderListResult as TLibraryUserOrderList
}
