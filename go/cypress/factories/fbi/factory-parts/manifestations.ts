import { Factory } from "fishery"

import { coverFactory } from "./cover"
import {
  audioBookManifestationIdentifierFactory,
  eBookManifestationIdentifierFactory,
} from "./identifier"
import { materialTypeAudioBookFactory, materialTypeEbookFactory } from "./materials"
import { Work } from "./works"

type Manifestation = Work["manifestations"]["all"][0]

export const eBookManifestationFactory = Factory.define<Manifestation>(() => ({
  accessTypes: [
    {
      code: "ONLINE",
      display: "online",
    },
  ],
  access: [
    {
      __typename: "Ereol",
      origin: "eReolen Go",
      url: "https://ereolengo.dk/ting/object/870970-basis:136357166",
      canAlwaysBeLoaned: false,
    },
    {
      __typename: "Ereol",
      origin: "eReolen",
      url: "https://ereolen.dk/ting/object/870970-basis:136357166",
      canAlwaysBeLoaned: false,
    },
  ],
  genreAndForm: ["myter", "billedbøger"],
  publisher: ["Publisher Name"],
  contributorsFromDescription: [],
  contributors: manifestationContributorFactory.buildList(2),
  cover: coverFactory.build(),
  pid: "870970-basis:38772791",
  identifiers: [eBookManifestationIdentifierFactory.build()],
  materialTypes: [materialTypeEbookFactory.build()],
  edition: {
    publicationYear: {
      display: "2023",
      year: 2023,
    },
    contributors: [],
    edition: "",
    summary: "2023",
  },
}))

export const audioBookManifestationFactory = Factory.define<Manifestation>(() => ({
  accessTypes: [
    {
      code: "ONLINE",
      display: "Digital",
    },
  ],
  access: [],
  genreAndForm: ["myter", "billedbøger"],
  publisher: ["Publisher Name"],
  contributorsFromDescription: [],
  contributors: manifestationContributorFactory.buildList(1),
  cover: coverFactory.build(),
  pid: "870970-basis:38772791",
  identifiers: [audioBookManifestationIdentifierFactory.build()],
  materialTypes: [materialTypeAudioBookFactory.build()],
  edition: {
    publicationYear: {
      display: "2022",
      year: 2022,
    },
    contributors: [],
    edition: "",
    summary: "2022",
  },
}))

export const manifestationContributorFactory = Factory.define<Manifestation["contributors"][0]>(
  ({ sequence }) => ({ display: `Contributor ${sequence}` })
)
