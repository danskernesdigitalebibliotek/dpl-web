import { NextRequest } from "next/server"
import { z } from "zod"

import { getSession } from "@/lib/session/session"

import { uniLoginUserInfoSchema } from "./schemas"
import { TUserInfo } from "./types"

export type AuthContextBase = { uniLoginUserInfo: TUserInfo }

export type HandlerWithAuth<TExtraContext = Record<string, unknown>> = (
  req: NextRequest,
  context: AuthContextBase & TExtraContext
) => Promise<Response>

// WithAuth middleware.
export function withAuth<TExtraContext = Record<string, unknown>>(
  handler: HandlerWithAuth<TExtraContext>
): (req: NextRequest, context: TExtraContext) => Promise<Response> {
  return async (req, extraContext: TExtraContext) => {
    const session = await getSession()

    try {
      z.object({
        isLoggedIn: z.literal(true),
        type: z.literal("unilogin"),
      }).parse(session)
      const uniLoginUserInfo = uniLoginUserInfoSchema.parse(session?.uniLoginUserInfo)

      // If authenticated, call the original handler
      return handler(req, { ...extraContext, uniLoginUserInfo })
    } catch (error) {
      console.error(error)
      return new Response("Not Authorized", { status: 401 })
    }
  }
}
