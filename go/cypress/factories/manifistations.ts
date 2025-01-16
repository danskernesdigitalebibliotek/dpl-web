import { Factory } from "fishery"

import { audioBookFactory, eBookFactory } from "./materials"
import { Work } from "./works"

type Manifestation = Work["manifestations"]["all"][0]

export const eBookManifistationFactory = Factory.define<Manifestation>(() => ({
  pid: "870970-basis:38772791",
  identifiers: [
    {
      type: "PUBLIZON",
      value: "9788711917145",
    },
    {
      type: "ISBN",
      value: "9788711917145",
    },
  ],
  materialTypes: [eBookFactory.build()],
}))

export const audioBookManifistationFactory = Factory.define<Manifestation>(() => ({
  pid: "870970-basis:38786768",
  identifiers: [
    {
      type: "PUBLIZON",
      value: "9788726204353",
    },
    {
      type: "ISBN",
      value: "9788726204353",
    },
  ],
  materialTypes: [audioBookFactory.build()],
}))
