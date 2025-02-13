import { NextResponse } from "next/server"
import { getPlaiceholder } from "plaiceholder"

export async function GET(request: Request): Promise<Response> {
  try {
    console.log(request, "request")
    const requestUrl = new URL(request.url)
    const url = requestUrl.searchParams.get("url")

    console.log(url, "url")

    if (!url) {
      return NextResponse.json({ error: "No url provided" }, { status: 400 })
    }

    const buffer = await fetch(url.toString()).then(async res =>
      Buffer.from(await res.arrayBuffer())
    )
    const { base64 } = await getPlaiceholder(buffer, {
      size: 20,
      saturation: 1.2,
      lightness: 1.3,
    })

    // res.status(200).send(base64)
    return Response.json({ data: { base64: base64 } }, { status: 200 })
  } catch (e) {
    return Response.json({ error: e }, { status: 500 })
  }
}
