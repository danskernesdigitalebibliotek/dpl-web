import { notFound } from "next/navigation"
import { NextRequest } from "next/server"

import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

const resources = {
  "/pubhub/v1/user/loans": {
    GET: {
      all: async () => {
        const client = await createClientAsync(
          "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
        )
        return await client.GetLibraryUserOrderListAsync({
          cardnumber: "1234567890",
          clientid: "1234567890",
          retailerid: "1234567890",
          retailerkeycode: "1234567890",
        })
      },
    },
  },
}

type TRoute = keyof typeof resources

export async function GET(request: NextRequest) {
  const currentPath = request.nextUrl.pathname as TRoute
  const resource = resources[currentPath]
  if (!resource) {
    return notFound()
  }

  // @todo Support loading identifier as well.
  const result = await resource.GET.all()
  return new Response(JSON.stringify({ result }))
}

export const dynamic = "force-dynamic"
