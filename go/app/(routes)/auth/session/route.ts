import { connection } from "next/server"

import { defaultSession, getSession } from "@/lib/session/session"

export async function GET() {
  await connection() // Opt into dynamic rendering
  try {
    const session = await getSession()

    if (!session) {
      return Response.json({ defaultSession })
    }

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      access_token,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      refresh_token,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id_token,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      adgangsplatformenUserToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      adgangsplatformenLibraryToken,
      ...nonSensitiveSessionProps
    } = session

    return Response.json(nonSensitiveSessionProps)
  } catch (e) {
    return Response.json({ error: e }, { status: 500 })
  }
}
