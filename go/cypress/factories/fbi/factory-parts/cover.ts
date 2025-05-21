import { Factory } from "fishery"

import { Cover } from "@/lib/graphql/generated/fbi/graphql"

export const coverFactory = Factory.define<Cover>(() => ({
  thumbnail: "https://placehold.co/120x173.jpg",
  xSmall: {
    url: "https://placehold.co/120x173.jpg",
    width: 120,
    height: 173,
  },
  small: {
    url: "https://placehold.co/240x346.jpg",
    width: 240,
    height: 346,
  },
  medium: {
    url: "https://placehold.co/480x691.jpg",
    width: 480,
    height: 691,
  },
  large: {
    url: "https://placehold.co/500x720.jpg",
    width: 500,
    height: 720,
  },
}))
