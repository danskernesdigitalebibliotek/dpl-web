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
    },
  },
} as WorkFullWorkPageFragment

export default workMock
