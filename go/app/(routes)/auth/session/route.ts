import { omit } from "es-toolkit/object"
import { connection } from "next/server"

import { defaultSession, getSessionDataProvider } from "@/lib/session/serverSideSession"

export async function GET() {
  await connection() // Opt into dynamic rendering
  try {
    const sessionData = await getSessionDataProvider()

    const session = await sessionData.getObject()

    if (!session) {
      return Response.json({ defaultSession })
    }

    const nonSensitiveSessionProps = omit(session, [
      "access_token",
      "refresh_token",
      "id_token",
      "adgangsplatformenUserToken",
      "adgangsplatformenLibraryToken",
    ])

    return Response.json(nonSensitiveSessionProps)
  } catch (e) {
    return Response.json({ error: e }, { status: 500 })
  }
}
