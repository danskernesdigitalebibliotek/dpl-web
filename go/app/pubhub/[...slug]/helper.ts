import { md5 } from "js-md5"

import { getDplCmsUniloginConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

const getPublizonServiceParameters = () => {
  return {
    clientid: process.env.UNLILOGIN_PUBHUB_CLIENT_ID ?? "",
    retailerid: process.env.UNLILOGIN_PUBHUB_RETAILER_ID ?? "",
    retailerkeycode: md5(process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE ?? ""),
  }
}

export const getPublizonResources = async () => {
  const uniloginConfig = await getDplCmsUniloginConfig()
  const uniloginClientid = uniloginConfig.clientId ?? null

  if (!uniloginClientid) {
    console.error("No unilogin client id found.")
    throw new Response("Internal Server Error", { status: 500 })
  }

  return {
    "/pubhub/v1/user/loans": {
      GET: {
        all: async () => {
          const client = await createClientAsync(
            "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
          )
          return await client.GetLibraryUserOrderListAsync({
            ...getPublizonServiceParameters(),
            cardnumber: process.env.TMP_PUBLIZON_GET_LIBRARY_USER_ORDER_LIST_CARD_NUMBER ?? "",
          })
        },
      },
    },
  }
}

export type TResources = Awaited<ReturnType<typeof getPublizonResources>>
export type TRoute = keyof TResources
