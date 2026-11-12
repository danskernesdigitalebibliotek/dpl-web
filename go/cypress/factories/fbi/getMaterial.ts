import { Factory } from "fishery"

import { placeholderImageUrl } from "@/cypress/factories/placeholder-image"
import { GetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

type Params = {
  hitcount: number
}

export default Factory.define<GetMaterialQuery, Params>(() => {
  return {
    work: {
      workId: "work-of:870970-basis:136817027",
      titles: {
        full: ["Ravnenes hvisken. Bog 1"],
        original: [],
      },
      creators: [
        {
          display: "Malene Sølvsten",
          __typename: "Person",
        },
      ],
      materialTypes: [
        {
          materialTypeGeneral: {
            display: "lydbøger",
            code: "AUDIO_BOOKS",
          },
          materialTypeSpecific: {
            code: "AUDIO_BOOK_ONLINE",
            display: "lydbog (online)",
          },
        },
        {
          materialTypeGeneral: {
            display: "e-bøger",
            code: "EBOOKS",
          },
          materialTypeSpecific: {
            code: "EBOOK",
            display: "e-bog",
          },
        },
        {
          materialTypeGeneral: {
            display: "bøger",
            code: "BOOKS",
          },
          materialTypeSpecific: {
            code: "BOOK",
            display: "bog",
          },
        },
      ],
      workYear: {
        display: "2016",
      },
      abstract: [
        "Den 17-årige Anne får et drømmeagtigt syn, hvor hun oplever et gammelt bestialsk mord på en ung rødhåret pige, i hvis ryg morderen har skåret et runetegn. Snart florerer en serie af voldsomme mord på egnen. Alle ofrene er rødhårede piger, og på dem alle er det mystiske runetegn.",
      ],
      manifestations: {
        all: [
          {
            materialTypes: [
              {
                materialTypeGeneral: {
                  code: "BOOKS",
                  display: "bøger",
                },
                materialTypeSpecific: {
                  code: "BOOK",
                  display: "bog",
                },
              },
            ],
            pid: "870970-basis:52398517",
            identifiers: [
              {
                type: "ISBN",
                value: "9788711492734",
              },
            ],
            cover: {
              thumbnail: placeholderImageUrl(120, 173),
              xSmall: {
                url: placeholderImageUrl(120, 173),
                width: 120,
                height: 181,
              },
              small: {
                url: placeholderImageUrl(240, 362),
                width: 240,
                height: 362,
              },
              medium: {
                url: placeholderImageUrl(480, 723),
                width: 480,
                height: 723,
              },
              large: {
                url: placeholderImageUrl(960, 1440),
                width: 531,
                height: 800,
              },
            },
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
            titles: {
              identifyingAddition: null,
              full: ["Ravnenes hvisken. Bog 1"],
            },
            languages: {
              main: [
                {
                  display: "dansk",
                  iso639Set1: "da",
                },
              ],
            },
            audience: {
              ages: [
                {
                  display: "14-16",
                },
              ],
            },
            series: [
              {
                numberInSeries: "Del 1",
                title: "Ravnenes hvisken",
              },
            ],
            subjects: {
              all: [
                {
                  display: "Elias Eriksen",
                },
                {
                  display: "Anne Stella Sakarias",
                },
                {
                  display: "Varnar",
                },
                {
                  display: "nordisk mytologi",
                },
                {
                  display: "venskab",
                },
                {
                  display: "parallelle verdener",
                },
                {
                  display: "romantisk",
                },
                {
                  display: "spændende",
                },
                {
                  display: "trist",
                },
                {
                  display: "uhyggelig",
                },
                {
                  display: "tankevækkende",
                },
                {
                  display: "venskaber",
                },
                {
                  display: "mit liv",
                },
                {
                  display: "fantasy",
                },
                {
                  display: "gys",
                },
                {
                  display: "action",
                },
              ],
            },
            physicalDescription: {
              summaryFull: "706 sider",
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
              edition: null,
              summary: "2016",
            },
            genreAndForm: ["romaner", "fantasy"],
            publisher: ["Carlsen"],
            contributors: [],
            contributorsFromDescription: [],
          },
          {
            materialTypes: [
              {
                materialTypeGeneral: {
                  code: "AUDIO_BOOKS",
                  display: "lydbøger",
                },
                materialTypeSpecific: {
                  code: "AUDIO_BOOK_ONLINE",
                  display: "lydbog (online)",
                },
              },
            ],
            pid: "870970-basis:53322743",
            identifiers: [
              {
                type: "PUBLIZON",
                value: "9788711668016",
              },
              {
                type: "ISBN",
                value: "9788711668016",
              },
            ],
            cover: {
              thumbnail: placeholderImageUrl(120, 173),
              xSmall: {
                url: placeholderImageUrl(120, 173),
                width: 120,
                height: 191,
              },
              small: {
                url: placeholderImageUrl(240, 362),
                width: 240,
                height: 382,
              },
              medium: {
                url: placeholderImageUrl(480, 723),
                width: 480,
                height: 763,
              },
              large: {
                url: placeholderImageUrl(960, 1440),
                width: 960,
                height: 1527,
              },
            },
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
                url: "https://ereolengo.dk/ting/object/870970-basis:53322743",
                canAlwaysBeLoaned: false,
              },
              {
                __typename: "Ereol",
                origin: "eReolen",
                url: "https://ereolen.dk/ting/object/870970-basis:53322743",
                canAlwaysBeLoaned: false,
              },
            ],
            titles: {
              identifyingAddition: null,
              full: ["Ravnenes hvisken. Bog 1"],
            },
            languages: {
              main: [
                {
                  display: "dansk",
                  iso639Set1: "da",
                },
              ],
            },
            audience: {
              ages: [
                {
                  display: "14-16",
                },
              ],
            },
            series: [
              {
                numberInSeries: "Del 1",
                title: "Ravnenes hvisken",
              },
            ],
            subjects: {
              all: [
                {
                  display: "Elias Eriksen",
                },
                {
                  display: "Anne Stella Sakarias",
                },
                {
                  display: "Varnar",
                },
                {
                  display: "nordisk mytologi",
                },
                {
                  display: "venskab",
                },
                {
                  display: "parallelle verdener",
                },
              ],
            },
            physicalDescription: {
              summaryFull: "20 t., 44 min.",
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
              edition: null,
              summary: "2016",
            },
            genreAndForm: ["fantasy", "romaner"],
            publisher: ["Lindhardt og Ringhof"],
            contributors: [
              {
                display: "Iben Haaest",
                roles: [],
              },
            ],
            contributorsFromDescription: [],
          },
          {
            materialTypes: [
              {
                materialTypeGeneral: {
                  code: "EBOOKS",
                  display: "e-bøger",
                },
                materialTypeSpecific: {
                  code: "EBOOK",
                  display: "e-bog",
                },
              },
            ],
            pid: "870970-basis:52380235",
            identifiers: [
              {
                type: "PUBLIZON",
                value: "9788711668016",
              },
              {
                type: "ISBN",
                value: "9788711668016",
              },
            ],
            cover: {
              thumbnail: placeholderImageUrl(120, 173),
              xSmall: {
                url: placeholderImageUrl(120, 173),
                width: 120,
                height: 178,
              },
              small: {
                url: placeholderImageUrl(240, 356),
                width: 240,
                height: 356,
              },
              medium: {
                url: placeholderImageUrl(480, 711),
                width: 480,
                height: 711,
              },
              large: {
                url: placeholderImageUrl(960, 1422),
                width: 960,
                height: 1422,
              },
            },
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
                url: "https://ereolen.dk/ting/object/870970-basis:52380235",
                canAlwaysBeLoaned: true,
              },
              {
                __typename: "Ereol",
                origin: "eReolen Go",
                url: "https://ereolengo.dk/ting/object/870970-basis:52380235",
                canAlwaysBeLoaned: true,
              },
            ],
            titles: {
              identifyingAddition: null,
              full: ["Ravnenes hvisken. Bog 1"],
            },
            languages: {
              main: [
                {
                  display: "dansk",
                  iso639Set1: "da",
                },
              ],
            },
            audience: {
              ages: [
                {
                  display: "14-16",
                },
              ],
            },
            series: [
              {
                numberInSeries: "Del 1",
                title: "Ravnenes hvisken",
              },
            ],
            subjects: {
              all: [
                {
                  display: "Elias Eriksen",
                },
                {
                  display: "Anne Stella Sakarias",
                },
                {
                  display: "Varnar",
                },
                {
                  display: "nordisk mytologi",
                },
                {
                  display: "venskab",
                },
                {
                  display: "parallelle verdener",
                },
              ],
            },
            physicalDescription: null,
            dateFirstEdition: {
              display: "2016",
            },
            edition: {
              publicationYear: {
                display: "2016",
                year: 2016,
              },
              edition: "1. e-bogsudgave",
              summary: "2016 (1. e-bogsudgave)",
            },
            genreAndForm: ["romaner", "fantasy"],
            publisher: ["Carlsen"],
            contributors: [],
            contributorsFromDescription: [],
          },
        ],
        bestRepresentation: {
          materialTypes: [
            {
              materialTypeGeneral: {
                code: "BOOKS",
                display: "bøger",
              },
              materialTypeSpecific: {
                code: "BOOK",
                display: "bog",
              },
            },
          ],
          pid: "870970-basis:52398517",
          identifiers: [
            {
              type: "ISBN",
              value: "9788711492734",
            },
          ],
          cover: {
            thumbnail: placeholderImageUrl(120, 173),
            xSmall: {
              url: placeholderImageUrl(120, 173),
              width: 120,
              height: 181,
            },
            small: {
              url: placeholderImageUrl(240, 362),
              width: 240,
              height: 362,
            },
            medium: {
              url: placeholderImageUrl(480, 723),
              width: 480,
              height: 723,
            },
            large: {
              url: placeholderImageUrl(960, 1440),
              width: 531,
              height: 800,
            },
          },
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
          titles: {
            identifyingAddition: null,
            full: ["Ravnenes hvisken. Bog 1"],
          },
          languages: {
            main: [
              {
                display: "dansk",
                iso639Set1: "da",
              },
            ],
          },
          audience: {
            ages: [
              {
                display: "14-16",
              },
            ],
          },
          series: [
            {
              numberInSeries: "Del 1",
              title: "Ravnenes hvisken",
            },
          ],
          subjects: {
            all: [
              {
                display: "Elias Eriksen",
              },
              {
                display: "Anne Stella Sakarias",
              },
              {
                display: "Varnar",
              },
              {
                display: "nordisk mytologi",
              },
              {
                display: "venskab",
              },
              {
                display: "parallelle verdener",
              },
              {
                display: "romantisk",
              },
              {
                display: "spændende",
              },
              {
                display: "trist",
              },
              {
                display: "uhyggelig",
              },
              {
                display: "tankevækkende",
              },
              {
                display: "venskaber",
              },
              {
                display: "mit liv",
              },
              {
                display: "fantasy",
              },
              {
                display: "gys",
              },
              {
                display: "action",
              },
            ],
          },
          physicalDescription: {
            summaryFull: "706 sider",
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
            edition: null,
            summary: "2016",
          },
          genreAndForm: ["romaner", "fantasy"],
          publisher: ["Carlsen"],
          contributors: [],
          contributorsFromDescription: [],
        },
      },
    },
  }
})
