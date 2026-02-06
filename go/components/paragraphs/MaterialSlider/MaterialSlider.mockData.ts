import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { ComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"

export const worksMock: ComplexSearchForWorkTeaserQuery["complexSearch"]["works"] = [
  {
    workId: "work-of:870970-basis:22252852",
    titles: {
      full: ["Harry Potter og De Vises Sten"],
      original: ["Harry Potter and the philosopher's stone"],
    },
    creators: [
      {
        display: "Joanne K. Rowling",
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
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: {
      display: "1997",
    },
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
          pid: "870970-basis:38289977",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702301588",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "356 sider, ill. i farver",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2020",
              year: 2020,
            },
            contributors: [],
            edition: "9. udgave",
            summary: "9. udgave, 2020",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "MinaLima (firma)",
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
          pid: "870970-basis:51980247",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702173222",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "355 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2015",
              year: 2015,
            },
            contributors: [],
            edition: "6 udgave",
            summary: "6 udgave, 2015",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:51989252",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702179859",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "246 sider, ill. i farver, 28cm",
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
            edition: "1. illustrerede udgave, 7. udgave",
            summary: "1. illustrerede udgave, 7. udgave, 2015",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Jim Kay",
            },
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:54871910",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702272451",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "355 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2018",
              year: 2018,
            },
            contributors: [],
            edition: "8. udgave",
            summary: "8. udgave, 2018",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:27638708",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702075380",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "1 cd i 1 mappe (mp3, 9 t., 40 min.)",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2009",
              year: 2009,
            },
            contributors: [],
            edition: "",
            summary: "2009",
          },
          genreAndForm: ["eventyrlige fortællinger", "romaner"],
          publisher: ["Gyldendal Lyd"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "Jesper Christensen (f. 1948)",
            },
          ],
          contributorsFromDescription: ["oversat fra engelsk af Hanna Lützen"],
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
        pid: "870970-basis:38289977",
        identifiers: [
          {
            type: "ISBN",
            value: "9788702301588",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "356 sider, ill. i farver",
        },
        dateFirstEdition: null,
        edition: {
          publicationYear: {
            display: "2020",
            year: 2020,
          },
          contributors: [],
          edition: "9. udgave",
          summary: "9. udgave, 2020",
        },
        genreAndForm: ["romaner", "fantasy"],
        publisher: ["Gyldendal"],
        contributors: [
          {
            display: "Hanna Lützen",
          },
          {
            display: "MinaLima (firma)",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:25197887",
    titles: {
      full: ["Harry Potter og Hemmelighedernes Kammer"],
      original: ["Harry Potter and the Chamber of Secrets"],
    },
    creators: [
      {
        display: "Joanne K. Rowling",
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
    workYear: {
      display: "1998",
    },
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
          pid: "870970-basis:61636935",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702319361",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "384 sider, ill. i farver",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2021",
              year: 2021,
            },
            contributors: [],
            edition: "9. udgave",
            summary: "9. udgave, 2021",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "MinaLima (firma)",
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
          pid: "870970-basis:51980239",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702173239",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "396 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2015",
              year: 2015,
            },
            contributors: [],
            edition: "6. udgave",
            summary: "6. udgave, 2015",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:27639097",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702075397",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "1 cd i 1 mappe (mp3, 11 t., 3 min.)",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2009",
              year: 2009,
            },
            contributors: [],
            edition: "",
            summary: "2009",
          },
          genreAndForm: ["eventyrlige fortællinger", "romaner"],
          publisher: ["Gyldendal Lyd"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "Jesper Christensen (f. 1948)",
            },
          ],
          contributorsFromDescription: ["oversat fra engelsk af Hanna Lützen"],
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
          pid: "710100-katalog:22677780",
          identifiers: [
            {
              type: "ISBN",
              value: "9788700459946",
            },
            {
              type: "ISBN",
              value: "87-00-45994-1",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "338 sider",
          },
          dateFirstEdition: {
            display: "1999",
          },
          edition: {
            publicationYear: {
              display: "1999",
              year: 1999,
            },
            contributors: [],
            edition: "2. udgave",
            summary: "2. udgave, 1999",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
          ],
          contributorsFromDescription: ["på dansk ved Hanna Lützen"],
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
          pid: "870970-basis:29316945",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702114331",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "338 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2012",
              year: 2012,
            },
            contributors: [],
            edition: "5. udgave",
            summary: "5. udgave, 2012",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:52652219",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702204681",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "259 sider, ill. i farver, 28cm",
          },
          dateFirstEdition: {
            display: "2016",
          },
          edition: {
            publicationYear: {
              display: "2016",
              year: 2016,
            },
            contributors: [],
            edition: "Illustreret udgave, 7. udgave",
            summary: "Illustreret udgave, 7. udgave, 2016",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Jim Kay",
            },
            {
              display: "Hanna Lützen",
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
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:25254031",
          identifiers: [
            {
              type: "ISBN",
              value: "87-02-02780-1",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "9 cd'er (11 t., 3 min.)",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2004",
              year: 2004,
            },
            contributors: [],
            edition: "",
            summary: "2004",
          },
          genreAndForm: ["eventyrlige fortællinger", "romaner"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "Jesper Christensen (f. 1948)",
            },
          ],
          contributorsFromDescription: ["oversat fra engelsk af Hanna Lützen"],
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
          pid: "870970-basis:54871929",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702272444",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "396 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2018",
              year: 2018,
            },
            contributors: [],
            edition: "8. udgave",
            summary: "8. udgave, 2018",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
        pid: "870970-basis:61636935",
        identifiers: [
          {
            type: "ISBN",
            value: "9788702319361",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "384 sider, ill. i farver",
        },
        dateFirstEdition: null,
        edition: {
          publicationYear: {
            display: "2021",
            year: 2021,
          },
          contributors: [],
          edition: "9. udgave",
          summary: "9. udgave, 2021",
        },
        genreAndForm: ["romaner", "fantasy"],
        publisher: ["Gyldendal"],
        contributors: [
          {
            display: "Hanna Lützen",
          },
          {
            display: "MinaLima (firma)",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:25197909",
    titles: {
      full: ["Harry Potter og Flammernes Pokal"],
      original: ["Harry Potter and the goblet of fire"],
    },
    creators: [
      {
        display: "Joanne K. Rowling",
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
    workYear: {
      display: "2000",
    },
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
          pid: "870970-basis:47092183",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702284799",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "450 sider, ill. i farver, 28 cm",
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
            edition: "Illustreret udgave, 8. udgave",
            summary: "Illustreret udgave, 8. udgave, 2019",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "Jim Kay",
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
          pid: "710100-katalog:23540703",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702002805",
            },
            {
              type: "ISBN",
              value: "87-02-00280-9",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "684 sider",
          },
          dateFirstEdition: {
            display: "2000",
          },
          edition: {
            publicationYear: {
              display: "2001",
              year: 2001,
            },
            contributors: [],
            edition: "2. udgave",
            summary: "2. udgave, 2001",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
          ],
          contributorsFromDescription: ["på dansk ved Hanna Lützen"],
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
          pid: "870970-basis:51980190",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702173253",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "615 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2015",
              year: 2015,
            },
            contributors: [],
            edition: "6. udgave",
            summary: "6. udgave, 2015",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:54871953",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702272475",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "615 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2018",
              year: 2018,
            },
            contributors: [],
            edition: "7. udgave",
            summary: "7. udgave, 2018",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:29317070",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702114362",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "684 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2012",
              year: 2012,
            },
            contributors: [],
            edition: "5. udgave",
            summary: "5. udgave, 2012",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
        pid: "870970-basis:47092183",
        identifiers: [
          {
            type: "ISBN",
            value: "9788702284799",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "450 sider, ill. i farver, 28 cm",
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
          edition: "Illustreret udgave, 8. udgave",
          summary: "Illustreret udgave, 8. udgave, 2019",
        },
        genreAndForm: ["romaner", "fantasy"],
        publisher: ["Gyldendal"],
        contributors: [
          {
            display: "Hanna Lützen",
          },
          {
            display: "Jim Kay",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:134823658",
    titles: {
      full: ["Atlas : historien om Pa Salt"],
      original: ["Atlas (engelsk)"],
    },
    creators: [
      {
        display: "Lucinda Riley",
        __typename: "Person",
      },
      {
        display: "Harry Whittaker",
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
          pid: "870970-basis:134823658",
          identifiers: [
            {
              type: "ISBN",
              value: "9788763865708",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "656 sider",
          },
          dateFirstEdition: {
            display: "2023",
          },
          edition: {
            publicationYear: {
              display: "2023",
              year: 2023,
            },
            contributors: [],
            edition: "1. udgave",
            summary: "1. udgave, 2023",
          },
          genreAndForm: ["romaner", "slægtsromaner", "historiske romaner"],
          publisher: ["Cicero"],
          contributors: [
            {
              display: "Birgitte Brix",
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
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:137288524",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702411799",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "2 cd'er i 1 mappe (mp3, 19 t., 45 min.)",
          },
          dateFirstEdition: {
            display: "2023",
          },
          edition: {
            publicationYear: {
              display: "2023",
              year: 2023,
            },
            contributors: [],
            edition: "",
            summary: "2023",
          },
          genreAndForm: ["slægtsromaner", "historiske romaner", "romaner"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Maria Stokholm",
            },
            {
              display: "Birgitte Brix",
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
        pid: "870970-basis:134823658",
        identifiers: [
          {
            type: "ISBN",
            value: "9788763865708",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "656 sider",
        },
        dateFirstEdition: {
          display: "2023",
        },
        edition: {
          publicationYear: {
            display: "2023",
            year: 2023,
          },
          contributors: [],
          edition: "1. udgave",
          summary: "1. udgave, 2023",
        },
        genreAndForm: ["romaner", "slægtsromaner", "historiske romaner"],
        publisher: ["Cicero"],
        contributors: [
          {
            display: "Birgitte Brix",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
  {
    workId: "work-of:870970-basis:27267912",
    titles: {
      full: ["Harry Potter og Dødsregalierne"],
      original: ["Harry Potter and the deathly hallows"],
    },
    creators: [
      {
        display: "Joanne K. Rowling",
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
          display: "bøger",
          code: "BOOKS",
        },
      },
    ],
    workYear: {
      display: "2007",
    },
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
                code: "AUDIO_BOOKS",
                display: "lydbøger",
              },
            },
          ],
          pid: "870970-basis:26931215",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702062311",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "20 cd'er (23 t., 45 min.)",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2007",
              year: 2007,
            },
            contributors: [],
            edition: "",
            summary: "2007",
          },
          genreAndForm: ["eventyrlige fortællinger", "romaner"],
          publisher: ["Gyldendal Lyd"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
            {
              display: "Jesper Christensen (f. 1948)",
            },
          ],
          contributorsFromDescription: ["oversat fra engelsk af Hanna Lützen"],
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
          pid: "870970-basis:29316910",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702114430",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "655 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2012",
              year: 2012,
            },
            contributors: [],
            edition: "4. udgave",
            summary: "4. udgave, 2012",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:51979591",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702173284",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "648 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2015",
              year: 2015,
            },
            contributors: [],
            edition: "5. udgave",
            summary: "5. udgave, 2015",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "870970-basis:54872186",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702272420",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "648 sider",
          },
          dateFirstEdition: null,
          edition: {
            publicationYear: {
              display: "2018",
              year: 2018,
            },
            contributors: [],
            edition: "6. udgave",
            summary: "6. udgave, 2018",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
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
          pid: "710100-katalog:26917921",
          identifiers: [
            {
              type: "ISBN",
              value: "9788702062281",
            },
          ],
          cover: coverFactory.build(),
          physicalDescription: {
            summaryFull: "655 sider",
          },
          dateFirstEdition: {
            display: "2007",
          },
          edition: {
            publicationYear: {
              display: "2007",
              year: 2007,
            },
            contributors: [],
            edition: "",
            summary: "2007",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Gyldendal"],
          contributors: [
            {
              display: "Hanna Lützen",
            },
          ],
          contributorsFromDescription: ["på dansk ved Hanna Lützen"],
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
        pid: "870970-basis:54872186",
        identifiers: [
          {
            type: "ISBN",
            value: "9788702272420",
          },
        ],
        cover: coverFactory.build(),
        physicalDescription: {
          summaryFull: "648 sider",
        },
        dateFirstEdition: null,
        edition: {
          publicationYear: {
            display: "2018",
            year: 2018,
          },
          contributors: [],
          edition: "6. udgave",
          summary: "6. udgave, 2018",
        },
        genreAndForm: ["romaner", "fantasy"],
        publisher: ["Gyldendal"],
        contributors: [
          {
            display: "Hanna Lützen",
          },
        ],
        contributorsFromDescription: [],
      },
    },
  },
]
