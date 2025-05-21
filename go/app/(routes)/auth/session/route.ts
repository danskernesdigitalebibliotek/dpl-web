import { defaultSession, getSession } from "@/lib/session/session"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return Response.json({ defaultSession })
    }
    return Response.json(session)
  } catch (e) {
    return Response.json({ error: e }, { status: 500 })
  }
}
