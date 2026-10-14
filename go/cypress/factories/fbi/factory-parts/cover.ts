import { Factory } from "fishery"

import { placeholderImageUrl } from "@/cypress/factories/placeholder-image"
import { Cover } from "@/lib/graphql/generated/fbi/graphql"

export const coverFactory = Factory.define<Cover>(() => ({
  thumbnail: placeholderImageUrl(120, 173),
  xSmall: {
    url: placeholderImageUrl(120, 173),
    width: 120,
    height: 173,
  },
  small: {
    url: placeholderImageUrl(240, 346),
    width: 240,
    height: 346,
  },
  medium: {
    url: placeholderImageUrl(480, 691),
    width: 480,
    height: 691,
  },
  large: {
    url: placeholderImageUrl(500, 720),
    width: 500,
    height: 720,
  },
}))
