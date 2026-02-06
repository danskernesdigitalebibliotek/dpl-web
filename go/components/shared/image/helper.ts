import { getPlaiceholder } from "plaiceholder"

export async function useGetBase64Image({ imageUrl }: { imageUrl: string }) {
  const buffer = await fetch(imageUrl).then(async res => Buffer.from(await res.arrayBuffer()))
  const { base64 } = await getPlaiceholder(buffer, { size: 64 })

  return base64
}
