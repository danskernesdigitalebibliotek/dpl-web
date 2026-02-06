import { Factory } from "fishery"

import { Work } from "./works"

type MaterialType = Work["materialTypes"][0]

export const materialTypeEbookFactory = Factory.define<MaterialType>(() => ({
  materialTypeGeneral: {
    display: "e-bøger",
    code: "EBOOKS",
  },
}))

export const materialTypeAudioBookFactory = Factory.define<MaterialType>(() => ({
  materialTypeGeneral: {
    display: "lydbøger",
    code: "AUDIO_BOOKS",
  },
}))
