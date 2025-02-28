import { md5 } from "js-md5"
import { notFound } from "next/navigation"
import { NextRequest } from "next/server"

import { getDplCmsUniloginConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

const getResources = async () => {
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
            cardnumber: process.env.TMP_PUBLIZON_GET_LIBRARY_USER_ORDER_LIST_CARD_NUMBER ?? "",
            clientid: process.env.UNLILOGIN_PUBHUB_CLIENT_ID ?? "",
            retailerid: process.env.UNLILOGIN_PUBHUB_RETAILER_ID ?? "",
            retailerkeycode: md5(process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE ?? ""),
          })
        },
      },
    },
  }
}

type TResources = Awaited<ReturnType<typeof getResources>>
type TRoute = keyof TResources

export async function GET(request: NextRequest) {
  const currentPath = request.nextUrl.pathname as TRoute
  const resources = await getResources()
  const resource = resources[currentPath]
  if (!resource) {
    return notFound()
  }

  // @todo Support loading identifier as well.
  const result = await resource.GET.all()
  return new Response(JSON.stringify({ result }))
}

export const dynamic = "force-dynamic"
