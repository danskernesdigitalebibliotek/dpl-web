import { getPublizonServiceParameters } from "@/app/pubhub/(lib)/helper"
import { TuserInfo } from "@/app/pubhub/(lib)/types"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

export const getLibraryUserOrderListRequest = async (userInfo: TuserInfo) => {
  const client = await createClientAsync(
    "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
  )
  const [response] = await client.GetLibraryUserOrderListAsync({
    ...getPublizonServiceParameters(),
    cardnumber: userInfo.uniid,
  })
  return response.GetLibraryUserOrderListResult
}
