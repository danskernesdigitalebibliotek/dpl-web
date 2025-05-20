import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"
import { getPublizonServiceParameters } from "@/lib/helpers/publizon"
import { createClientAsync as friendlyCardNumberClientAsync } from "@/lib/soap/publizon/v2_7/generated/getfriendlycardnumber"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

import { TFriendlyCardNumberResultSchema, TLibraryUserOrderList } from "./types"

// This is a default response for the library user order list response.
// In case no data is returned from the getlibraryuserorderlist SOAP service,
// we will use this default response to avoid errors in the frontend.
// THIS OBJECT IS NOT CORRESPONDING TO THE REAL RESPONSE. BUT TO THE INFERRED ZOD SCHEMA.
// TODO: Look into the real response and make this accurate.
const defaultData: TLibraryUserOrderList = {
  response: {
    status: {
      LibraryExtension: {
        maxloanpertime: "0",
        maxloanpertimesound: "0",
        userebookloansremain: "0",
        usertotalloans: "0",
        usertotalebookloans: "0",
        usertotalsoundloans: "0",
      },
    },
    data: {
      orderitem: [],
      friendlycardnumber: "",
    },
  },
}

export const getLibraryUserOrderListRequest = async (uniLoginUserInfo: TUserInfo) => {
  const client = await createClientAsync(
    "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
  )
  const [libraryUserResponse] = await client.GetLibraryUserOrderListAsync({
    ...getPublizonServiceParameters(),
    cardnumber: uniLoginUserInfo.uniid,
  })

  // TLibraryUserOrderList IS NOT CORRESPONDING TO THE REAL RESPONSE. BUT TO THE INFERRED ZOD SCHEMA.
  let libraryUserOrderList =
    libraryUserResponse.GetLibraryUserOrderListResult as TLibraryUserOrderList

  // Check if the response data is empty
  // TODO: write a test for this case inside __tests__/pubhub.test.ts
  if (!libraryUserOrderList.response?.data) {
    const friendlyCardNumberClient = await friendlyCardNumberClientAsync(
      "./lib/soap/publizon/v2_7/wsdl/getfriendlycardnumber.wsdl"
    )
    const [friendlyCardNumberResponse] = await friendlyCardNumberClient.GetFriendlyCardnumberAsync({
      ...getPublizonServiceParameters(),
      cardnumber: uniLoginUserInfo.uniid,
    })

    // If the response data is empty, use the default data and request friendly card number specifically
    const friendlyCardNumberResult =
      friendlyCardNumberResponse.GetFriendlyCardnumberResult as TFriendlyCardNumberResultSchema

    if (friendlyCardNumberResult.response.data) {
      const friendlyCardNumber = friendlyCardNumberResult.response.data.FriendlyCardNumber

      defaultData.response.data.friendlycardnumber = friendlyCardNumber
      libraryUserOrderList = defaultData
    }
  }

  return libraryUserOrderList
}
