import { NextRequest } from "next/server"
import { z } from "zod"

import { getSession } from "@/lib/session/session"

import { userInfoSchema } from "./schemas"

type Handler = <TContext>(req: NextRequest, context?: TContext) => Promise<Response>

// WithAuth middleware.
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
