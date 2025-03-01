import { getDplCmsUniloginConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

import { getPublizonServiceParameters } from "./helper"

export const publizonResources = async (uniid: string) => {
  const uniloginConfig = await getDplCmsUniloginConfig()
  const uniloginClientid = uniloginConfig.clientId ?? null

  if (!uniloginClientid) {
    console.error("No unilogin client id found.")
    throw new Response("Internal Server Error", { status: 500 })
  }

  return {
    "/pubhub/v1/user/loans": {
      GET: {
        one: async (identifier: string) => {
          const client = await createClientAsync(
            "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
          )
          return await client.GetLibraryUserOrderAsync({
            ...getPublizonServiceParameters(),
            cardnumber: uniid,
            ebookid: identifier,
          })
        },
        all: async () => {
          const client = await createClientAsync(
            "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
          )
          return await client.GetLibraryUserOrderListAsync({
            ...getPublizonServiceParameters(),
            cardnumber: uniid,
          })
        },
      },
    },
  }
}

export type TResources = Awaited<ReturnType<typeof publizonResources>>
export type TRoute = keyof TResources
