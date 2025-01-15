import { Factory } from "fishery"

import { SearchFacetsQuery } from "@/lib/graphql/generated/fbi/graphql"

export default Factory.define<SearchFacetsQuery>(() => ({
  search: {
    facets: [
      {
        name: "materialTypesGeneral",
        values: [
          {
            key: "podcasts",
            term: "podcasts",
            score: 181,
          },
          {
            key: "lydbøger",
            term: "lydbøger",
            score: 9,
          },
          {
            key: "e-bøger",
            term: "e-bøger",
            score: 2,
          },
        ],
      },
      {
        name: "mainLanguages",
        values: [
          {
            key: "dan",
            term: "Dansk",
            score: 185,
          },
          {
            key: "fao",
            term: "Færøsk",
            score: 7,
          },
        ],
      },
      {
        name: "age",
        values: [
          {
            key: "for 8 år",
            term: "for 8 år",
            score: 4,
          },
          {
            key: "for 10 år",
            term: "for 10 år",
            score: 2,
          },
          {
            key: "for 11 år",
            term: "for 11 år",
            score: 2,
          },
          {
            key: "for 12 år",
            term: "for 12 år",
            score: 2,
          },
          {
            key: "for 5 år",
            term: "for 5 år",
            score: 2,
          },
          {
            key: "for 6 år",
            term: "for 6 år",
            score: 2,
          },
          {
            key: "for 7 år",
            term: "for 7 år",
            score: 2,
          },
          {
            key: "for 9 år",
            term: "for 9 år",
            score: 2,
          },
        ],
      },
      {
        name: "lix",
        values: [],
      },
      {
        name: "subjects",
        values: [
          {
            key: "magi",
            term: "magi",
            score: 180,
          },
          {
            key: "fantasy",
            term: "fantasy",
            score: 176,
          },
          {
            key: "trolddom",
            term: "trolddom",
            score: 176,
          },
          {
            key: "harry potter",
            term: "harry potter",
            score: 171,
          },
          {
            key: "joanne k. rowling",
            term: "joanne k. rowling",
            score: 97,
          },
          {
            key: "engelsk litteratur",
            term: "engelsk litteratur",
            score: 96,
          },
          {
            key: "harry potter-bøger",
            term: "harry potter-bøger",
            score: 96,
          },
          {
            key: "mystik",
            term: "mystik",
            score: 94,
          },
          {
            key: "troldmænd",
            term: "troldmænd",
            score: 89,
          },
          {
            key: "albus dumbledore",
            term: "albus dumbledore",
            score: 85,
          },
          {
            key: "alderstrin: fra 14 år",
            term: "alderstrin: fra 14 år",
            score: 85,
          },
          {
            key: "analyse",
            term: "analyse",
            score: 85,
          },
          {
            key: "bøger",
            term: "bøger",
            score: 85,
          },
          {
            key: "danmark",
            term: "danmark",
            score: 85,
          },
          {
            key: "de vises sten",
            term: "de vises sten",
            score: 85,
          },
          {
            key: "fangen fra azkaban",
            term: "fangen fra azkaban",
            score: 85,
          },
          {
            key: "hemmelighedernes kammer",
            term: "hemmelighedernes kammer",
            score: 85,
          },
          {
            key: "hermione granger",
            term: "hermione granger",
            score: 85,
          },
          {
            key: "hogwarts",
            term: "hogwarts",
            score: 85,
          },
          {
            key: "j.k rowling",
            term: "j.k rowling",
            score: 85,
          },
          {
            key: "kulturstudier",
            term: "kulturstudier",
            score: 85,
          },
          {
            key: "litteratur",
            term: "litteratur",
            score: 85,
          },
          {
            key: "medievidenskab",
            term: "medievidenskab",
            score: 85,
          },
          {
            key: "podcast for børn og unge",
            term: "podcast for børn og unge",
            score: 85,
          },
          {
            key: "ron weasley",
            term: "ron weasley",
            score: 85,
          },
          {
            key: "skønlitteratur for børn og unge: fantasy og magisk realisme",
            term: "skønlitteratur for børn og unge: fantasy og magisk realisme",
            score: 85,
          },
          {
            key: "skønlitteratur: narrative temaer",
            term: "skønlitteratur: narrative temaer",
            score: 85,
          },
          {
            key: "tidlige 21. århundrede, 2000 til 2050",
            term: "tidlige 21. århundrede, 2000 til 2050",
            score: 85,
          },
          {
            key: "trylle",
            term: "trylle",
            score: 85,
          },
          {
            key: "harry potter og hemmelighedernes kammer",
            term: "harry potter og hemmelighedernes kammer",
            score: 24,
          },
          {
            key: "harry potter og de vises sten",
            term: "harry potter og de vises sten",
            score: 20,
          },
          {
            key: "harry potter og flammernes pokal",
            term: "harry potter og flammernes pokal",
            score: 19,
          },
          {
            key: "harry potter og fangen fra azkaban",
            term: "harry potter og fangen fra azkaban",
            score: 14,
          },
          {
            key: "harry potter og fønixordenen",
            term: "harry potter og fønixordenen",
            score: 10,
          },
          {
            key: "for børn og unge",
            term: "for børn og unge",
            score: 7,
          },
          {
            key: "børnebøger",
            term: "børnebøger",
            score: 2,
          },
          {
            key: "børnelitteratur",
            term: "børnelitteratur",
            score: 2,
          },
          {
            key: "england",
            term: "england",
            score: 2,
          },
          {
            key: "forfattere",
            term: "forfattere",
            score: 2,
          },
          {
            key: "kendte",
            term: "kendte",
            score: 2,
          },
          {
            key: "krea og kultur",
            term: "krea og kultur",
            score: 2,
          },
          {
            key: "potter, harry",
            term: "potter, harry",
            score: 2,
          },
          {
            key: "amerikansk film",
            term: "amerikansk film",
            score: 1,
          },
          {
            key: "anderledeshed",
            term: "anderledeshed",
            score: 1,
          },
          {
            key: "david yates",
            term: "david yates",
            score: 1,
          },
          {
            key: "egypten",
            term: "egypten",
            score: 1,
          },
          {
            key: "engelsk film",
            term: "engelsk film",
            score: 1,
          },
          {
            key: "funktionsnedsættelse",
            term: "funktionsnedsættelse",
            score: 1,
          },
          {
            key: "grindelwalds forbrydelser",
            term: "grindelwalds forbrydelser",
            score: 1,
          },
          {
            key: "halloween",
            term: "halloween",
            score: 1,
          },
        ],
      },
    ],
  },
}))
