import { Factory } from "fishery"

import { Cover, CoverImageUrls } from "@/lib/rest/cover-service-api/generated/model"

type Params = {
  type: Cover["type"]
}

export default Factory.define<Cover, Params>(({ sequence, transientParams }) => ({
  id: sequence.toString(),
  type: transientParams.type || "pid",
  imageUrls: getImageUrls(),
}))

const getImageUrls = (): CoverImageUrls => {
  const imageUrls: CoverImageUrls = {}

  ;(Object.keys(imageUrls) as Array<keyof CoverImageUrls>).forEach(key => {
    imageUrls[key] = {
      url: "https://placehold.co/375x540",
      format: "jpg",
      size: key,
    }
  })

  return imageUrls
}
