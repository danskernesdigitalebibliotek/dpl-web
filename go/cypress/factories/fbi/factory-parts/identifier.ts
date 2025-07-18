import { Factory } from "fishery"

import { Work } from "./works"

type TIdentifier = Work["manifestations"]["all"][0]["identifiers"][0]

export const IDENTIFIERS = {
  EBOOK: "9788711917141",
  AUDIOBOOK: "8788711917141",
}

export const audioBookManifestationIdentifierFactory = Factory.define<TIdentifier>(() => ({
  type: "ISBN",
  value: IDENTIFIERS.AUDIOBOOK,
}))

export const eBookManifestationIdentifierFactory = Factory.define<TIdentifier>(() => ({
  type: "ISBN",
  value: IDENTIFIERS.EBOOK,
}))
