import { md5 } from "js-md5"
import { NextRequest } from "next/server"
import { z } from "zod"

import { getSession } from "@/lib/session/session"

import { userInfoSchema } from "./schemas"

export const getPublizonServiceParameters = () => {
  return {
    clientid: process.env.UNLILOGIN_PUBHUB_CLIENT_ID ?? "",
    retailerid: process.env.UNLILOGIN_PUBHUB_RETAILER_ID ?? "",
    retailerkeycode: md5(process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE ?? ""),
  }
}

// WithAuth middleware.
type Handler = (req: NextRequest, context?: any) => Promise<Response>

export function withAuth(handler: Handler): Handler {
  return async (req, context) => {
    const session = await getSession()

    try {
      z.object({
        isLoggedIn: z.literal(true),
        type: z.literal("unilogin"),
      }).parse(session)
      const userInfo = userInfoSchema.parse(session?.userInfo)

      // If authenticated, call the original handler
      return handler(req, { ...context, userInfo })
    } catch (error) {
      console.error(error)
      return new Response("Not Authorized", { status: 401 })
    }
  }
}
