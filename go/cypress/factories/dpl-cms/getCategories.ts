import { Factory } from "fishery"

import { GetCategoriesQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

export default Factory.define<GetCategoriesQuery>(() => {
  return {
    goCategories: {
      results: [
        {
          id: "cab7d538-109f-47d1-b266-3dd6fbcfb2e2",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/science-fiction",
          categoryMenuTitle: "sci-fi",
          categoryMenuImage: {
            name: "Billeder til kategoriindgange - WIP!.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/Billeder%20til%20kategoriindgange%20-%20WIP%21.png",
              alt: "Science fiction  - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 765019,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746616597,
          },
        },
        {
          id: "21afd19f-0dc6-434a-b2f6-648b772acc1b",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/gys",
          categoryMenuTitle: "Gys",
          categoryMenuImage: {
            name: "1.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/1.png",
              alt: "GYS - kategoriindgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 880758,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746615983,
          },
        },
        {
          id: "ed1f9e25-cb06-4078-8e25-f7f0de1f6fae",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/gys-test",
          categoryMenuTitle: "Fakta",
          categoryMenuImage: {
            name: "4.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/4.png",
              alt: "Fakta - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 1029709,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746623684,
          },
        },
        {
          id: "5b2236b0-ad47-4e8d-994f-09cf1308e1e2",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/kaerlighed-og-forelskelse",
          categoryMenuTitle: "Kærlighed",
          categoryMenuImage: {
            name: "6.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/6.png",
              alt: "KÆRLIGHED - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 777551,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746615803,
          },
        },
        {
          id: "ee3a056c-5be5-4824-85cd-9ce536c83f1e",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/spaending",
          categoryMenuTitle: "Spænding",
          categoryMenuImage: {
            name: "8.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/8.png",
              alt: "Spænding - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 923515,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746621716,
          },
        },
        {
          id: "31e6207b-043e-4695-b0f8-53c6a2a2f614",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/sport",
          categoryMenuTitle: "Sport",
          categoryMenuImage: {
            name: "Billeder til kategoriindgange - WIP! (1).png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/Billeder%20til%20kategoriindgange%20-%20WIP%21%20%281%29.png",
              alt: "Sport - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 824448,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746621839,
          },
        },
        {
          id: "9af8cb6f-50b5-494d-ae8a-2f746b1f9c2d",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/venner",
          categoryMenuTitle: "Venner",
          categoryMenuImage: {
            name: "3.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/3.png",
              alt: "Venner - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 1139190,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746621985,
          },
        },
        {
          id: "fc111615-a8fe-45ee-87cc-94046b18b431",
          path: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/laes-efter-dit-humoer",
          categoryMenuTitle: "Mood",
          categoryMenuImage: {
            name: "5.png",
            mediaImage: {
              url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/5.png",
              alt: "Mood - indgang",
              height: 1000,
              width: 1000,
              mime: "image/png",
              size: 1007596,
              title: null,
            },
            byline: null,
          },
          changed: {
            timestamp: 1746622046,
          },
        },
      ],
    },
  }
})
