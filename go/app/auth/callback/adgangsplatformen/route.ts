import { NextResponse } from "next/server"
import { z } from "zod"

import goConfig from "@/lib/config/goConfig"
import {
  getSession,
  saveAdgangsplatformenSession,
  setAdgangsplatformenUserTokenOnSession,
} from "@/lib/session/session"

import loadUserToken from "./loadUserToken"

export async function GET() {
  const userTokenData = await loadUserToken()

  if (userTokenData) {
    const validation = z
      .object({
        token: z.string(),
        expire: z.number(),
      })
      .safeParse(userTokenData)

    if (validation.success) {
      const session = await getSession()
      await saveAdgangsplatformenSession(session, validation.data)
      return NextResponse.redirect(`${goConfig("app.url")}/user/profile`)
    }
  }

  return NextResponse.redirect(goConfig("app.url") ?? "/")
}

export const dynamic = "force-dynamic"
