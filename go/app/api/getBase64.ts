import { getPlaiceholder } from "plaiceholder"

export default async (req, res) => {
  console.log("req", req)
  console.log("res", res)

  const { body } = req
  const { src } = body

  const buffer = await fetch(src.toString()).then(async res => Buffer.from(await res.arrayBuffer()))
  const { base64 } = await getPlaiceholder(buffer, { size: 50 })

  res.status(200).send(base64)
}
