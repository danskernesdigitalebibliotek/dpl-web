import { NextRequest } from "next/server"
import { z } from "zod"

import { getSession } from "@/lib/session/session"

import { uniLoginUserInfoSchema } from "./schemas"
import { TUserInfo } from "./types"

export type AuthContext = { uniLoginUserInfo: TUserInfo }

export type HandlerWithAuth = (req: NextRequest, context: AuthContext) => Promise<Response>

// WithAuth middleware.
export function withAuth(handler: HandlerWithAuth): (req: NextRequest) => Promise<Response> {
  return async req => {
    const session = await getSession()

    try {
      z.object({
        isLoggedIn: z.literal(true),
        type: z.literal("unilogin"),
      }).parse(session)
      const uniLoginUserInfo = uniLoginUserInfoSchema.parse(session?.uniLoginUserInfo)

      // If authenticated, call the original handler
      return handler(req, { ...context, uniLoginUserInfo })
    } catch (error) {
      console.error(error)
      return new Response("Not Authorized", { status: 401 })
    }
  }
}
