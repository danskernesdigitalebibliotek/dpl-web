import { Factory } from "fishery"

import { Cover, CoverImageUrls, imageUrlSize } from "@/lib/rest/cover-service-api/generated/model"

type Params = {
  type: Cover["type"]
}

export default Factory.define<Cover, Params>(({ sequence, transientParams }) => ({
  id: sequence.toString(),
  type: transientParams.type || "pid",
  imageUrls: getImageUrls(),
}))

const getImageUrls = (): CoverImageUrls => {
  const sizes = Object.keys(imageUrlSize) as Array<keyof typeof imageUrlSize>
  const imageUrls: CoverImageUrls = {}

  sizes.forEach(size => {
    imageUrls[size] = {
      url: "https://placehold.co/375x375.jpg",
      format: "jpeg",
      size: size,
    }
  })

  return imageUrls
}
