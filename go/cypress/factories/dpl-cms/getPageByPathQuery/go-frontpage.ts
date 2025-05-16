import { Factory } from "fishery"

import { GetPageByPathQuery } from "@/lib/graphql/generated/dpl-cms/graphql"

export default Factory.define<GetPageByPathQuery>(() => {
  return {
    route: {
      __typename: "RouteInternal",
      url: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/go-frontpage",
      entity: {
        paragraphs: [
          {
            __typename: "ParagraphGoVideoBundleAutomatic",
            cqlSearch: {
              value:
                "term.title='gåsehud' AND term.childrenoradults= 'børn' AND ( term.generalmaterialtype='e-bøger' OR term.generalmaterialtype='lydbøger')",
            },
            goVideoTitle: "Hvad er din største frygt? | Lea anbefaler Gåsehud",
            embedVideo: {
              id: "7fc12944-4955-48b9-a0e6-dd3e55ab45c4",
              name: "Læs den, hvis du tør!",
              mediaVideotool: "https://media.videotool.dk?vn=557_2024062111110397319436605901",
            },
            videoAmountOfMaterials: 10,
            id: "f2f834a0-eb5f-461c-bf6a-99db8a2eb243",
          },
          {
            __typename: "ParagraphGoVideo",
            id: "1760762a-7bdf-4300-92a0-781c54e86663",
            created: {
              timestamp: 1745565881,
            },
            title: "TRÆK MIG OP! Jeg DRUKNER!! | Gang Beasts | LitGaming",
            embedVideo: {
              id: "f69dfe07-1668-47b2-ac18-949145f0f31e",
              name: "TRÆK MIG OP! Jeg DRUKNER!! | Gang Beasts | LitGaming ",
              mediaVideotool: "https://media.videotool.dk?vn=557_2024070413002075865498967878",
            },
          },
          {
            __typename: "ParagraphGoLinkbox",
            title: "Gyserbøger",
            goImage: {
              name: "Linkboks -GYS- test til nyt website.png",
              mediaImage: {
                url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-05/Linkboks%20-GYS-%20test%20til%20nyt%20website.png",
                alt: "Gys - indgang til kategori",
                height: 1000,
                width: 1000,
                mime: "image/png",
                size: 790593,
                title: null,
              },
              byline: null,
            },
            goColor: null,
            goDescription: "De her bøger er ikke for sarte sjæle!",
            goLinkParagraph: {
              link: {
                title: "Læs, hvis du tør!",
                url: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/kategori/gys-test",
              },
              targetBlank: false,
              ariaLabel: null,
            },
          },
          {
            __typename: "ParagraphGoVideoBundleAutomatic",
            cqlSearch: {
              value:
                "'gaming' AND ( term.generalmaterialtype='bøger' OR term.generalmaterialtype='e-bøger' OR term.generalmaterialtype='lydbøger')",
            },
            goVideoTitle: "Lit Gaming",
            embedVideo: {
              id: "7baa79d0-acfc-4b8c-a8bc-45b5555ffa61",
              name: "I snakker så MEGET LORT | Falls Guys | LitGaming ",
              mediaVideotool: "https://media.videotool.dk/?vn=557_2024070412592885465731986449",
            },
            videoAmountOfMaterials: 10,
            id: "444e506f-0952-4cac-898d-7750ce2e9748",
          },
          {
            __typename: "ParagraphGoVideoBundleManual",
            id: "fb248e2a-8d78-41a6-b80e-b5063cca740e",
            goVideoTitle: "Adrian løser læsekrisen!",
            embedVideo: {
              id: "019590bb-facb-4e75-8041-d1b0bf2276b2",
              name: "Adrians bogklub 2.0",
              mediaVideotool: "https://media.videotool.dk?vn=557_2025010614502071929993093451",
            },
            videoBundleWorkIds: [
              {
                material_type: "e-bog",
                work_id: "work-of:870970-basis:138640027",
              },
              {
                material_type: "lydbog (online)",
                work_id: "work-of:870970-basis:137734184",
              },
              {
                material_type: "bog",
                work_id: "work-of:870970-basis:46203453",
              },
            ],
          },
          {
            __typename: "ParagraphGoMaterialSliderAutomatic",
            cqlSearch: {
              value:
                " term.subject='sjove' AND term.childrenoradults= 'børn' AND ( term.generalmaterialtype='e-bøger' OR term.generalmaterialtype='lydbøger') AND term.accesstype='online'",
            },
            titleOptional: "Sjove bøger, du ikke kan lægge fra dig",
            sliderAmountOfMaterials: 18,
          },
          {
            __typename: "ParagraphGoVideo",
            id: "814ff8c1-0139-4dcb-9921-933f903212af",
            created: {
              timestamp: 1740131427,
            },
            title: "Adrians bogklub 2.0",
            embedVideo: {
              id: "019590bb-facb-4e75-8041-d1b0bf2276b2",
              name: "Adrians bogklub 2.0",
              mediaVideotool: "https://media.videotool.dk?vn=557_2025010614502071929993093451",
            },
          },
          {
            __typename: "ParagraphGoLinkbox",
            title: "For de modige",
            goImage: {
              name: "311015_gysergru.png",
              mediaImage: {
                url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-03/311015_gysergru.png",
                alt: "Gys i kælderen",
                height: 500,
                width: 500,
                mime: "image/png",
                size: 271842,
                title: null,
              },
              byline: null,
            },
            goColor: "content_color_2",
            goDescription:
              "Kan du lide at få gåsehud og leve dig ind i de uhyggelige bøgers verden? Er du til fantasy, zombier, overtro, spøgelser eller sjove gysere? ",
            goLinkParagraph: {
              link: {
                title: "Så se meget mere om gys lige her",
                url: "https://ereolengo.dk/inspiration/gys",
              },
              targetBlank: false,
              ariaLabel: null,
            },
          },
          {
            __typename: "ParagraphGoVideoBundleManual",
            id: "2078f564-0e72-4897-b693-742bf979224d",
            goVideoTitle: "Anbefalinger til dig",
            embedVideo: {
              id: "c5b67876-f150-45bc-bf4e-760801c79f30",
              name: "Kaya anbefaler Wimpy Kid‐serien",
              mediaVideotool: "https://media.videotool.dk?vn=557_2024121813322134777736762715",
            },
            videoBundleWorkIds: [
              {
                material_type: "",
                work_id: "work-of:870970-basis:136109251",
              },
              {
                material_type: "e-bog",
                work_id: "work-of:870970-basis:136163256",
              },
              {
                material_type: "e-bog",
                work_id: "work-of:870970-basis:136199315",
              },
              {
                material_type: "e-bog",
                work_id: "work-of:870970-basis:136248677",
              },
              {
                material_type: "e-bog",
                work_id: "work-of:870970-basis:136270656",
              },
            ],
          },
          {
            __typename: "ParagraphGoMaterialSliderManual",
            titleOptional: "Knuds farfar fortæller sjove røverhistorier",
            materialSliderWorkIds: [
              {
                material_type: "",
                work_id: "work-of:870970-basis:135444111",
              },
              {
                material_type: "",
                work_id: "work-of:870970-basis:135444375",
              },
              {
                material_type: "",
                work_id: "work-of:870970-basis:135444448",
              },
              {
                material_type: "",
                work_id: "work-of:870970-basis:135444499",
              },
            ],
          },
          {
            __typename: "ParagraphGoVideoBundleManual",
            id: "756c96fc-0b0c-4899-a29c-cdef78a24565",
            goVideoTitle: "Hvad er din STØRSTE LØGN? | Ida anbefaler Pigeliv 2",
            embedVideo: {
              id: "88636a49-1d81-4504-92d3-4af31489aad9",
              name: "Nadin og Ida anbefaler",
              mediaVideotool: "https://media.videotool.dk?vn=557_2024122009434463486994182557",
            },
            videoBundleWorkIds: [
              {
                material_type: "",
                work_id: "work-of:870970-basis:46381114",
              },
            ],
          },
          {
            __typename: "ParagraphGoLinkbox",
            title: "Orlaprisen 2025",
            goImage: {
              name: "orla_cms.png",
              mediaImage: {
                url: "https://cms-demo.dpl-cms.dplplat01.dpl.reload.dk/sites/default/files/2025-03/orla_cms.png",
                alt: null,
                height: 670,
                width: 896,
                mime: "image/png",
                size: 714426,
                title: null,
              },
              byline: null,
            },
            goColor: "content_color_2",
            goDescription: "FAQ om Orlaprisen 2025",
            goLinkParagraph: {
              link: {
                title: "Læs mere her",
                url: "https://go-demo.cms-demo.dpl-cms.dplplat01.dpl.reload.dk/artikel/orlaprisen-2025",
              },
              targetBlank: false,
              ariaLabel: null,
            },
          },
        ],
      },
    },
  }
})
