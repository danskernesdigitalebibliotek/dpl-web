import { Factory } from "fishery"

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
              thumbnail: "https://placehold.co/120x173.jpg",
              xSmall: {
                url: "https://placehold.co/120x173.jpg",
                width: 120,
                height: 181,
              },
              small: {
                url: "https://placehold.co/240x362.jpg",
                width: 240,
                height: 362,
              },
              medium: {
                url: "https://placehold.co/480x723.jpg",
                width: 480,
                height: 723,
              },
              large: {
                url: "https://placehold.co/960x1440.jpg",
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
                  isoCode: "dan",
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
              thumbnail: "https://placehold.co/120x173.jpg",
              xSmall: {
                url: "https://placehold.co/120x173.jpg",
                width: 120,
                height: 191,
              },
              small: {
                url: "https://placehold.co/240x362.jpg",
                width: 240,
                height: 382,
              },
              medium: {
                url: "https://placehold.co/480x723.jpg",
                width: 480,
                height: 763,
              },
              large: {
                url: "https://placehold.co/960x1440.jpg",
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
                  isoCode: "dan",
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
              thumbnail: "https://placehold.co/120x173.jpg",
              xSmall: {
                url: "https://placehold.co/120x173.jpg",
                width: 120,
                height: 178,
              },
              small: {
                url: "https://placehold.co/240x356.jpg",
                width: 240,
                height: 356,
              },
              medium: {
                url: "https://placehold.co/480x711.jpg",
                width: 480,
                height: 711,
              },
              large: {
                url: "https://placehold.co/960x1422.jpg",
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
                  isoCode: "dan",
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
              contributors: [],
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
            thumbnail: "https://placehold.co/120x173.jpg",
            xSmall: {
              url: "https://placehold.co/120x173.jpg",
              width: 120,
              height: 181,
            },
            small: {
              url: "https://placehold.co/240x362.jpg",
              width: 240,
              height: 362,
            },
            medium: {
              url: "https://placehold.co/480x723.jpg",
              width: 480,
              height: 723,
            },
            large: {
              url: "https://placehold.co/960x1440.jpg",
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
                isoCode: "dan",
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
