import { Factory } from "fishery"

import { audioBookFactory, eBookFactory } from "./materials"
import { Work } from "./works"

type Manifestation = Work["manifestations"]["all"][0]

export const eBookManifestationFactory = Factory.define<Manifestation>(() => ({
  pid: "1",
  genreAndForm: ["myter", "billedbøger"],
  publisher: ["Publisher Name"],
  contributorsFromDescription: [],
  contributors: manifestationContributorFactory.buildList(2),
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

export const audioBookManifestationFactory = Factory.define<Manifestation>(() => ({
  pid: "2",
  genreAndForm: ["myter", "billedbøger"],
  publisher: ["Publisher Name"],
  contributorsFromDescription: [],
  contributors: manifestationContributorFactory.buildList(1),
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

export const manifestationContributorFactory = Factory.define<Manifestation["contributors"][0]>(
  ({ sequence }) => ({ display: `Contributor ${sequence}` })
)
