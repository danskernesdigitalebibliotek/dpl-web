import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

export const worksMock: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"] = [
  {
    workId: "work-of:870970-basis:39018608",
    titles: {
      full: ["Kvinde kend din historie : spejl dig i fortiden"],
      original: [],
    },
    creators: [
      {
        display: "Gry Jexen",
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
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: null,
    manifestations: {
      all: [
        {
          accessTypes: [
            {
              code: "PHYSICAL",
              display: "fysisk",
            },
          ],
          access: [
            {
              __typename: "InterLibraryLoan",
              loanIsPossible: true,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "BOOKS",
                display: "bøger",
              },
            },
          ],
          pid: "870970-basis:39018608",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702300529",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "335 sider, ill. i farver",
          },
          dateFirstEdition: {
            display: "2021",
          },
          edition: {
            publicationYear: {
              display: "2021",
              year: 2021,
            },
            contributors: [],
            edition: "1. udgave",
            summary: "1. udgave, 2021",
          },
          genreAndForm: ["biografier"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Thit Thyrring",
            },
          ],
          contributorsFromDescription: [],
        },
        {
          accessTypes: [
            {
              code: "ONLINE",
              display: "online",
            },
          ],
          access: [
            {
              __typename: "Ereol",
              origin: "eReolen",
              url: "https://ereolen.dk/ting/object/870970-basis:39018594",
              canAlwaysBeLoaned: false,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "EBOOKS",
                display: "e-bøger",
              },
            },
          ],
          pid: "870970-basis:39018594",
          identifiers: [
            {
              type: "PUBLIZON",
              value: "9788702325362",
            },
            {
              type: "ISBN",
              value: "9788702325362",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "Ill. i farver",
          },
          dateFirstEdition: {
            display: "2021",
          },
          edition: {
            publicationYear: {
              display: "2021",
              year: 2021,
            },
            contributors: [],
            edition: "1. e-bogsudgave",
            summary: "1. e-bogsudgave, 2021",
          },
          genreAndForm: ["biografier"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Thit Thyrring",
            },
          ],
          contributorsFromDescription: [],
        },
      ],
      bestRepresentation: {
        accessTypes: [
          {
            code: "PHYSICAL",
            display: "fysisk",
          },
        ],
        access: [
          {
            __typename: "InterLibraryLoan",
            loanIsPossible: true,
          },
        ],
        materialTypes: [
          {
            materialTypeGeneral: {
              code: "BOOKS",
              display: "bøger",
            },
          },
        ],
        pid: "870970-basis:39018608",
        identifiers: [
          {
            type: "ISBN",
            value: "9788702300529",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "335 sider, ill. i farver",
        },
        dateFirstEdition: {
          display: "2021",
        },
        edition: {
          publicationYear: {
            display: "2021",
            year: 2021,
          },
          contributors: [],
          edition: "1. udgave",
          summary: "1. udgave, 2021",
        },
        genreAndForm: ["biografier"],
        publisher: ["Gyldendal"],
        contributors: [
          {
            display: "Thit Thyrring",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:52200504",
    titles: {
      full: ["Det sensitive hjerte : når alle døre står åbne"],
      original: [],
    },
    creators: [
      {
        display: "Emilie Jahnnie Sigård",
        __typename: "Person",
      },
    ],
    materialTypes: [
      {
        materialTypeGeneral: {
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: null,
    manifestations: {
      all: [
        {
          accessTypes: [
            {
              code: "PHYSICAL",
              display: "fysisk",
            },
          ],
          access: [
            {
              __typename: "InterLibraryLoan",
              loanIsPossible: true,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "BOOKS",
                display: "bøger",
              },
            },
          ],
          pid: "870970-basis:52144493",
          identifiers: [
            {
              type: "ISBN",
              value: "9788799865208",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "414 sider, ill.",
          },
          dateFirstEdition: {
            display: "2015",
          },
          edition: {
            publicationYear: {
              display: "2015",
              year: 2015,
            },
            contributors: [],
            edition: "1. udgave",
            summary: "1. udgave, 2015",
          },
          genreAndForm: [],
          publisher: ["Emija"],
          contributors: [],
          contributorsFromDescription: [],
        },
      ],
      bestRepresentation: {
        accessTypes: [
          {
            code: "PHYSICAL",
            display: "fysisk",
          },
        ],
        access: [
          {
            __typename: "InterLibraryLoan",
            loanIsPossible: true,
          },
        ],
        materialTypes: [
          {
            materialTypeGeneral: {
              code: "BOOKS",
              display: "bøger",
            },
          },
        ],
        pid: "870970-basis:52144493",
        identifiers: [
          {
            type: "ISBN",
            value: "9788799865208",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "414 sider, ill.",
        },
        dateFirstEdition: {
          display: "2015",
        },
        edition: {
          publicationYear: {
            display: "2015",
            year: 2015,
          },
          contributors: [],
          edition: "1. udgave",
          summary: "1. udgave, 2015",
        },
        genreAndForm: [],
        publisher: ["Emija"],
        contributors: [],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:62910593",
    titles: {
      full: ["Generation 7/7 : beretninger fra 25 unge voksne med skilte forældre"],
      original: [],
    },
    creators: [
      {
        display: "Emilie Stein",
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
      {
        materialTypeGeneral: {
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: null,
    manifestations: {
      all: [
        {
          accessTypes: [
            {
              code: "ONLINE",
              display: "online",
            },
          ],
          access: [
            {
              __typename: "Ereol",
              origin: "eReolen",
              url: "https://ereolen.dk/ting/object/870970-basis:62910585",
              canAlwaysBeLoaned: false,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "EBOOKS",
                display: "e-bøger",
              },
            },
          ],
          pid: "870970-basis:62910585",
          identifiers: [
            {
              type: "PUBLIZON",
              value: "9788702341812",
            },
            {
              type: "ISBN",
              value: "9788702341812",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "202 sider, ill. i farver",
          },
          dateFirstEdition: {
            display: "2022",
          },
          edition: {
            publicationYear: {
              display: "2022",
              year: 2022,
            },
            contributors: [],
            edition: "1. e-bogsudgave",
            summary: "1. e-bogsudgave, 2022",
          },
          genreAndForm: [],
          publisher: ["Gyldendal"],
          contributors: [],
          contributorsFromDescription: [],
        },
        {
          accessTypes: [
            {
              code: "PHYSICAL",
              display: "fysisk",
            },
          ],
          access: [
            {
              __typename: "InterLibraryLoan",
              loanIsPossible: true,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "BOOKS",
                display: "bøger",
              },
            },
          ],
          pid: "870970-basis:62910593",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702341805",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "202 sider, ill. i farver",
          },
          dateFirstEdition: {
            display: "2022",
          },
          edition: {
            publicationYear: {
              display: "2022",
              year: 2022,
            },
            contributors: [],
            edition: "1. udgave",
            summary: "1. udgave, 2022",
          },
          genreAndForm: [],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Thit Thyrring",
            },
          ],
          contributorsFromDescription: [],
        },
        {
          accessTypes: [
            {
              code: "ONLINE",
              display: "online",
            },
          ],
          access: [
            {
              __typename: "Ereol",
              origin: "eReolen",
              url: "https://ereolen.dk/ting/object/870970-basis:62935537",
              canAlwaysBeLoaned: false,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:62935537",
          identifiers: [
            {
              type: "PUBLIZON",
              value: "9788702341829",
            },
            {
              type: "ISBN",
              value: "9788702341829",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "2 t., 8 min.",
          },
          dateFirstEdition: {
            display: "2022",
          },
          edition: {
            publicationYear: {
              display: "2022",
              year: 2022,
            },
            contributors: [],
            edition: "",
            summary: "2022",
          },
          genreAndForm: [],
          publisher: ["Gyldendal"],
          contributors: [],
          contributorsFromDescription: [],
        },
      ],
      bestRepresentation: {
        accessTypes: [
          {
            code: "PHYSICAL",
            display: "fysisk",
          },
        ],
        access: [
          {
            __typename: "InterLibraryLoan",
            loanIsPossible: true,
          },
        ],
        materialTypes: [
          {
            materialTypeGeneral: {
              code: "BOOKS",
              display: "bøger",
            },
          },
        ],
        pid: "870970-basis:62910593",
        identifiers: [
          {
            type: "ISBN",
            value: "9788702341805",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "202 sider, ill. i farver",
        },
        dateFirstEdition: {
          display: "2022",
        },
        edition: {
          publicationYear: {
            display: "2022",
            year: 2022,
          },
          contributors: [],
          edition: "1. udgave",
          summary: "1. udgave, 2022",
        },
        genreAndForm: [],
        publisher: ["Gyldendal"],
        contributors: [
          {
            display: "Thit Thyrring",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:46313151",
    titles: {
      full: ["Lilys længsel"],
      original: ["Then came you"],
    },
    creators: [
      {
        display: "Lisa Kleypas",
        __typename: "Person",
      },
    ],
    materialTypes: [
      {
        materialTypeGeneral: {
          display: "lydbøger",
          code: "AUDIO_BOOKS",
        },
      },
      {
        materialTypeGeneral: {
          display: "e-bøger",
          code: "EBOOKS",
        },
      },
      {
        materialTypeGeneral: {
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: null,
    manifestations: {
      all: [
        {
          accessTypes: [
            {
              code: "ONLINE",
              display: "online",
            },
          ],
          access: [
            {
              __typename: "AccessUrl",
              origin: "nota.dk",
              url: "https://nota.dk/bibliotek/bogid/47078",
              loginRequired: false,
            },
            {
              __typename: "Ereol",
              origin: "eReolen",
              url: "https://ereolen.dk/ting/object/870970-basis:48241638",
              canAlwaysBeLoaned: false,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:48241638",
          identifiers: [
            {
              type: "PUBLIZON",
              value: "9788763861823",
            },
            {
              type: "ISBN",
              value: "9788763861823",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "11 t., 18 min.",
          },
          dateFirstEdition: {
            display: "2019",
          },
          edition: {
            publicationYear: {
              display: "2019",
              year: 2019,
            },
            contributors: [],
            edition: "",
            summary: "2019",
          },
          genreAndForm: ["kærlighedsromaner", "historiske romaner", "romaner"],
          publisher: ["Cicero"],
          contributors: [
            {
              display: "Camilla Qvistgaard Dyssel",
            },
            {
              display: "Emilie Harild Gaardboe",
            },
          ],
          contributorsFromDescription: [],
        },
        {
          accessTypes: [
            {
              code: "ONLINE",
              display: "online",
            },
          ],
          access: [
            {
              __typename: "Ereol",
              origin: "eReolen",
              url: "https://ereolen.dk/ting/object/870970-basis:46313143",
              canAlwaysBeLoaned: false,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "EBOOKS",
                display: "e-bøger",
              },
            },
          ],
          pid: "870970-basis:46313143",
          identifiers: [
            {
              type: "PUBLIZON",
              value: "9788763860963",
            },
            {
              type: "ISBN",
              value: "9788763860963",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: null,
          dateFirstEdition: {
            display: "2019",
          },
          edition: {
            publicationYear: {
              display: "2019",
              year: 2019,
            },
            contributors: [],
            edition: "1. eBogsudgave",
            summary: "1. eBogsudgave, 2019",
          },
          genreAndForm: ["romaner", "kærlighedsromaner", "historiske romaner"],
          publisher: ["Pretty Ink"],
          contributors: [
            {
              display: "Emilie Harild Gaardboe",
            },
          ],
          contributorsFromDescription: [],
        },
        {
          accessTypes: [
            {
              code: "PHYSICAL",
              display: "fysisk",
            },
          ],
          access: [
            {
              __typename: "InterLibraryLoan",
              loanIsPossible: true,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "BOOKS",
                display: "bøger",
              },
            },
          ],
          pid: "870970-basis:46313151",
          identifiers: [
            {
              type: "ISBN",
              value: "9788763860956",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "389 sider",
          },
          dateFirstEdition: {
            display: "2019",
          },
          edition: {
            publicationYear: {
              display: "2019",
              year: 2019,
            },
            contributors: [],
            edition: "1. udgave",
            summary: "1. udgave, 2019",
          },
          genreAndForm: ["romaner", "kærlighedsromaner", "historiske romaner"],
          publisher: ["Pretty Ink"],
          contributors: [
            {
              display: "Emilie Harild Gaardboe",
            },
          ],
          contributorsFromDescription: [],
        },
      ],
      bestRepresentation: {
        accessTypes: [
          {
            code: "PHYSICAL",
            display: "fysisk",
          },
        ],
        access: [
          {
            __typename: "InterLibraryLoan",
            loanIsPossible: true,
          },
        ],
        materialTypes: [
          {
            materialTypeGeneral: {
              code: "BOOKS",
              display: "bøger",
            },
          },
        ],
        pid: "870970-basis:46313151",
        identifiers: [
          {
            type: "ISBN",
            value: "9788763860956",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "389 sider",
        },
        dateFirstEdition: {
          display: "2019",
        },
        edition: {
          publicationYear: {
            display: "2019",
            year: 2019,
          },
          contributors: [],
          edition: "1. udgave",
          summary: "1. udgave, 2019",
        },
        genreAndForm: ["romaner", "kærlighedsromaner", "historiske romaner"],
        publisher: ["Pretty Ink"],
        contributors: [
          {
            display: "Emilie Harild Gaardboe",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:50506878",
    titles: {
      full: ["Biologi 9 : elevbog"],
      original: [],
    },
    creators: [
      {
        display: "Pernille Ulla Andersen",
        __typename: "Person",
      },
      {
        display: "Ulla Hjøllund Linderoth",
        __typename: "Person",
      },
    ],
    materialTypes: [
      {
        materialTypeGeneral: {
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: null,
    manifestations: {
      all: [
        {
          accessTypes: [
            {
              code: "PHYSICAL",
              display: "fysisk",
            },
          ],
          access: [
            {
              __typename: "InterLibraryLoan",
              loanIsPossible: true,
            },
          ],
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "BOOKS",
                display: "bøger",
              },
            },
          ],
          pid: "870970-basis:50506878",
          identifiers: [
            {
              type: "ISBN",
              value: "9788777028229",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "128 sider, ill. i farver",
          },
          dateFirstEdition: {
            display: "2013",
          },
          edition: {
            publicationYear: {
              display: "2013",
              year: 2013,
            },
            contributors: [],
            edition: "1. udgave",
            summary: "1. udgave, 2013",
          },
          genreAndForm: ["undervisningsmaterialer"],
          publisher: ["Geografforlaget"],
          contributors: [
            {
              display: "Emilie Søndergaard",
            },
            {
              display: "Jesper Frederiksen",
            },
            {
              display: "Jens Sørensen",
            },
          ],
          contributorsFromDescription: [],
        },
      ],
      bestRepresentation: {
        accessTypes: [
          {
            code: "PHYSICAL",
            display: "fysisk",
          },
        ],
        access: [
          {
            __typename: "InterLibraryLoan",
            loanIsPossible: true,
          },
        ],
        materialTypes: [
          {
            materialTypeGeneral: {
              code: "BOOKS",
              display: "bøger",
            },
          },
        ],
        pid: "870970-basis:50506878",
        identifiers: [
          {
            type: "ISBN",
            value: "9788777028229",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "128 sider, ill. i farver",
        },
        dateFirstEdition: {
          display: "2013",
        },
        edition: {
          publicationYear: {
            display: "2013",
            year: 2013,
          },
          contributors: [],
          edition: "1. udgave",
          summary: "1. udgave, 2013",
        },
        genreAndForm: ["undervisningsmaterialer"],
        publisher: ["Geografforlaget"],
        contributors: [
          {
            display: "Emilie Søndergaard",
          },
          {
            display: "Jesper Frederiksen",
          },
          {
            display: "Jens Sørensen",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
]
