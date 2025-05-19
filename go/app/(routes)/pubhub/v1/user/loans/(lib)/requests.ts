import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"
import { getPublizonServiceParameters } from "@/lib/helpers/publizon"
import { createClientAsync as friendlyCardNumberClientAsync } from "@/lib/soap/publizon/v2_7/generated/getfriendlycardnumber"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

import { TFriendlyCardNumberResultSchema, TLibraryUserOrderList } from "./types"

const defaultData = {
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
      loans: [],
      libraryData: {
        maxAmountPerMonth: 0,
        maxConcurrentAudiobookLoansPerBorrower: 0,
        maxConcurrentEbookLoansPerBorrower: 0,
      },
      userData: {
        totalLoans: 0,
        totalEbookLoans: 0,
        totalAudioLoans: 0,
        ebookLoansRemaining: 0,
        audiobookLoansRemaining: 0,
        friendlyCardNumber: "",
      },
    },
  },
} as TLibraryUserOrderList

export const getLibraryUserOrderListRequest = async (uniLoginUserInfo: TUserInfo) => {
  const client = await createClientAsync(
    "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
  )
  const [libraryUserResponse] = await client.GetLibraryUserOrderListAsync({
    ...getPublizonServiceParameters(),
    cardnumber: uniLoginUserInfo.uniid,
  })

  const friendlyCardNumberClient = await friendlyCardNumberClientAsync(
    "./lib/soap/publizon/v2_7/wsdl/getfriendlycardnumber.wsdl"
  )
  const [friendlyCardNumberResponse] = await friendlyCardNumberClient.GetFriendlyCardnumberAsync({
    ...getPublizonServiceParameters(),
    cardnumber: uniLoginUserInfo.uniid,
  })

  let libraryUserOrderList =
    libraryUserResponse.GetLibraryUserOrderListResult as TLibraryUserOrderList

  if (!libraryUserOrderList.response?.data) {
    const friendlyCardNumberResult =
      friendlyCardNumberResponse.GetFriendlyCardnumberResult as TFriendlyCardNumberResultSchema

    if (friendlyCardNumberResult?.response.data) {
      const friendlyCardNumber = friendlyCardNumberResult?.response?.data?.FriendlyCardNumber

      const tempObject = { ...defaultData }
      tempObject.response.data.friendlycardnumber = friendlyCardNumber || ""
      libraryUserOrderList = defaultData
    }
  }

  return libraryUserOrderList
}
