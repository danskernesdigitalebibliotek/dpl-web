import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

const manifestationMock = {
  pid: "870970-basis:51579623",
  accessTypes: [],
  identifiers: [
    {
      type: "PUBLIZON",
      value: "9788762722880",
    },
    {
      type: "ISBN",
      value: "9788762722880",
    },
  ],
  materialTypes: [
    {
      materialTypeGeneral: {
        display: "e-bøger",
        code: "EBOOKS",
      },
    },
  ],
  access: [
    {
      __typename: "Ereol",
      origin: "eReolen",
      url: "https://ereolen.dk/ting/object/870970-basis:51579623",
      canAlwaysBeLoaned: false,
    },
    {
      __typename: "Ereol",
      origin: "eReolen Go",
      url: "https://ereolengo.dk/ting/object/870970-basis:51579623",
      canAlwaysBeLoaned: false,
    },
  ],
  titles: {
    identifyingAddition: null,
    full: ["Den vingede hest Skar"],
  },
  languages: {
    main: [
      {
        display: "dansk",
        isoCode: "dan",
      },
    ],
  },
  audience: {
    ages: [
      {
        display: "9-11",
      },
    ],
  },
  series: [
    {
      numberInSeries: "Del 14",
      title: "Monsterjagten",
    },
  ],
  subjects: {
    all: [
      {
        display: "monstre",
      },
    ],
  },
  physicalDescription: {
    summaryFull: "112 sider, ill.",
  },
  dateFirstEdition: {
    display: "2015",
  },
  genreAndForm: ["roman", "fantasy"],
  publisher: ["Flachs"],
  cover: coverFactory.build(),
  contributors: [
    {
      display: "Trine Bech",
    },
    {
      display: "Steve Sims",
    },
  ],
  contributorsFromDescription: [],
} as ManifestationWorkPageFragment

export default manifestationMock
