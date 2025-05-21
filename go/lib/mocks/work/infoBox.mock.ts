import { coverFactory } from "@/cypress/factories/factory-parts/cover"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

const workMock = {
  workId: "work-of:870970-basis:28412932",
  titles: {
    full: ["Den vingede hest Skar"],
    original: ["Skor the winged stallion"],
  },
  creators: [
    {
      display: "Adam Blade",
      __typename: "Person",
    },
  ],
  materialTypes: [
    {
      materialTypeGeneral: {
        display: "e-bøger",
        code: "EBOOKS",
      },
    },
    {
      materialTypeGeneral: {
        display: "lydbøger",
        code: "AUDIO_BOOKS",
      },
    },
  ],
  workYear: {
    display: "2008",
  },
  abstract: [
    "Fantasy. Tom er stadig i Gorgonia. Denne gang skal han redde Epos fra den væmmelige hest Skar.",
  ],
  manifestations: {
    all: [
      {
        pid: "870970-basis:38634097",
        identifiers: [
          {
            type: "PUBLIZON",
            value: "9788762735934",
          },
          {
            type: "ISBN",
            value: "9788762735934",
          },
        ],
        materialTypes: [
          {
            materialTypeGeneral: {
              display: "lydbøger",
              code: "AUDIO_BOOKS",
            },
          },
        ],
        accessTypes: [],
        access: [
          {
            __typename: "Ereol",
            origin: "eReolen Go",
            url: "https://ereolengo.dk/ting/object/870970-basis:38634097",
            canAlwaysBeLoaned: false,
          },
          {
            __typename: "Ereol",
            origin: "eReolen",
            url: "https://ereolen.dk/ting/object/870970-basis:38634097",
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
          summaryFull: "61 min.",
        },
        dateFirstEdition: null,
        genreAndForm: ["fantasy", "romaner", "roman"],
        publisher: ["Gad"],
        cover: coverFactory.build(),
        contributors: [
          {
            display: "Michael Brostrup",
          },
          {
            display: "Trine Bech",
          },
        ],
        contributorsFromDescription: [],
      },
      {
        pid: "870970-basis:51579623",
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
        accessTypes: [],
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
        contributors: [
          {
            display: "Trine Bech",
          },
          {
            display: "Steve Sims",
          },
        ],
        contributorsFromDescription: [],
      },
    ],
    bestRepresentation: {
      pid: "870970-basis:38634097",
      identifiers: [
        {
          type: "PUBLIZON",
          value: "9788762735934",
        },
        {
          type: "ISBN",
          value: "9788762735934",
        },
      ],
      materialTypes: [
        {
          materialTypeGeneral: {
            display: "lydbøger",
            code: "AUDIO_BOOKS",
          },
        },
      ],
      accessTypes: [],
      access: [
        {
          __typename: "Ereol",
          origin: "eReolen Go",
          url: "https://ereolengo.dk/ting/object/870970-basis:38634097",
          canAlwaysBeLoaned: false,
        },
        {
          __typename: "Ereol",
          origin: "eReolen",
          url: "https://ereolen.dk/ting/object/870970-basis:38634097",
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
        summaryFull: "61 min.",
      },
      dateFirstEdition: null,
      genreAndForm: ["fantasy", "romaner", "roman"],
      publisher: ["Gad"],
      cover: coverFactory.build(),
      contributors: [
        {
          display: "Michael Brostrup",
        },
        {
          display: "Trine Bech",
        },
      ],
      contributorsFromDescription: [],
    },
  },
} as WorkFullWorkPageFragment

export default workMock
