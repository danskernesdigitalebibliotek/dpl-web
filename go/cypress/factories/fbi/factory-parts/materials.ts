import { Factory } from "fishery"

import { Work } from "./works"

type MaterialType = Work["materialTypes"][0]

export const materialTypeEbookFactory = Factory.define<MaterialType>(() => ({
  materialTypeGeneral: {
    display: "e-bøger",
    code: "EBOOKS",
  },
  materialTypeSpecific: {
    code: "EBOOK",
    display: "e-bog",
  },
}))

export const materialTypeAudioBookFactory = Factory.define<MaterialType>(() => ({
  materialTypeGeneral: {
    display: "lydbøger",
    code: "AUDIO_BOOKS",
  },
  materialTypeSpecific: {
    code: "AUDIO_BOOK_ONLINE",
    display: "lydbog (online)",
  },
}))
