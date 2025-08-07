import { Factory } from "fishery"

import { Work } from "./works"

type TIdentifier = Work["manifestations"]["all"][0]["identifiers"][0]

export const identifierFactory = Factory.define<string>(transientParams => {
  const { sequence = 0 } = transientParams
  return `${8788711917140 + sequence}`
})

export const audioBookManifestationIdentifierFactory = Factory.define<TIdentifier>(() => ({
  type: "ISBN",
  value: "8788711917141",
}))

export const eBookManifestationIdentifierFactory = Factory.define<TIdentifier>(() => ({
  type: "ISBN",
  value: "9788711917141",
}))
