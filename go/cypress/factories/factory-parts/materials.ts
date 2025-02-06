import { Factory } from "fishery"

import { Work } from "./works"

type MaterialType = Work["materialTypes"][0]

export const eBookFactory = Factory.define<MaterialType>(() => ({
  materialTypeGeneral: {
    display: "e-bøger",
    code: "EBOOKS",
  },
}))

export const audioBookFactory = Factory.define<MaterialType>(() => ({
  materialTypeGeneral: {
    display: "lydbøger",
    code: "AUDIO_BOOKS",
  },
}))
