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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/120px!AIw2isGJrelqVJtsay-2dx8Wjg7y13BlsoouFI3s8yw0Vw",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/120px!AIw2isGJrelqVJtsay-2dx8Wjg7y13BlsoouFI3s8yw0Vw",
              width: 120,
              height: 183,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/240px!AIza6GPpMpyFnOKPIYmu7NRA9S5gwnsk-NYpy4tNkUEr-w",
              width: 240,
              height: 367,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/480px!AIx5DDlBC54gRtYW0p2OW42QwvqQNdw92mOYKNMd4aiOhw",
              width: 480,
              height: 733,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/960px!AIzdYLXcAqtM-r9AdtHFGzGocxJsuoq7K_IH2kaqWfpwsA",
              width: 500,
              height: 764,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/g7e9nwMdQIG_6Zh5d52XeQ/120px!AIxC9Gr5DEIEECPz8MuP3fHgs3bLwF1OW9aWTL8jV8BInQ",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/g7e9nwMdQIG_6Zh5d52XeQ/120px!AIxC9Gr5DEIEECPz8MuP3fHgs3bLwF1OW9aWTL8jV8BInQ",
              width: 120,
              height: 185,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/g7e9nwMdQIG_6Zh5d52XeQ/240px!AIxkbwFcQAFXPrWN5ZDP-Ldrpz5ZssAXR1RW0TG4YHsXAA",
              width: 240,
              height: 370,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/g7e9nwMdQIG_6Zh5d52XeQ/480px!AIxaurGgsaoYrOdnpz3uwmi-3lTemyJGiDkrtNwJHQeeaA",
              width: 480,
              height: 739,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/g7e9nwMdQIG_6Zh5d52XeQ/960px!AIyBnpu13WhCegL-JzYlL-uVTjlA3YWN3bQF5Jb-wdGyiA",
              width: 500,
              height: 770,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/jvdXPtEbQjSBc3ZnY0_Q3A/120px!AIwLI1sfwzd1V83YigGZb8I17pqstJ2tZJwX9D9ufOqJKg",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/jvdXPtEbQjSBc3ZnY0_Q3A/120px!AIwLI1sfwzd1V83YigGZb8I17pqstJ2tZJwX9D9ufOqJKg",
              width: 120,
              height: 142,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/jvdXPtEbQjSBc3ZnY0_Q3A/240px!AIzhHzogdFbrsgEKqKszSdk_8G0GIrwLqbHcZccREZ6uPw",
              width: 240,
              height: 285,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/jvdXPtEbQjSBc3ZnY0_Q3A/480px!AIyV7mHRBsxuyEkxc6loantD5uLvTr_W6OziQMJM0XY2Lg",
              width: 480,
              height: 569,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/jvdXPtEbQjSBc3ZnY0_Q3A/960px!AIytv4yvMgZN0t5xdL5Bq9s-Hr-UGuST8dYsYVbS91gnFw",
              width: 500,
              height: 593,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/1xvmvvo6RtubcUD34thJQg/120px!AIz0O7HB3TdDiUa6QLhddal0yqGrS0-SM7cokoD0c_evfA",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/1xvmvvo6RtubcUD34thJQg/120px!AIz0O7HB3TdDiUa6QLhddal0yqGrS0-SM7cokoD0c_evfA",
              width: 120,
              height: 193,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/1xvmvvo6RtubcUD34thJQg/240px!AIzxsPCodapScHILdA04oIjiTLI0Ofr9isawACIe4yFRwg",
              width: 240,
              height: 385,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/1xvmvvo6RtubcUD34thJQg/480px!AIz6qhZhwd6WIF_etM6dqkhEpF4kGSP9fViu1gQfnryn1w",
              width: 480,
              height: 771,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/1xvmvvo6RtubcUD34thJQg/960px!AIyfngQmDMBMZyLLnhAYoQfu97MF-ERfUPEtFIS1sA1arA",
              width: 500,
              height: 803,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/9WB5UfP_RsahOzSKwcPuUQ/120px!AIzdroPEHB-4PncJHAU8ShKvEthf0PoqDkByMSIwWScOnQ",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/9WB5UfP_RsahOzSKwcPuUQ/120px!AIzdroPEHB-4PncJHAU8ShKvEthf0PoqDkByMSIwWScOnQ",
              width: 120,
              height: 162,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/9WB5UfP_RsahOzSKwcPuUQ/240px!AIwN8JYBHVlqYdJfrJtDDQXEzWyAxuj9sJnMpEh0DudZXQ",
              width: 240,
              height: 324,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/9WB5UfP_RsahOzSKwcPuUQ/480px!AIxZat9vG8eyTT7Rh_1ZBpG_dLDTNk_vNholRJer7TgefQ",
              width: 480,
              height: 649,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/9WB5UfP_RsahOzSKwcPuUQ/960px!AIwO7R96F6t6vPFMKyTa_4SB8ZuleyYzQCmuJ2qAw5R7Pw",
              width: 500,
              height: 676,
            },
          },
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
        cover: {
          thumbnail:
            "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/120px!AIw2isGJrelqVJtsay-2dx8Wjg7y13BlsoouFI3s8yw0Vw",
          xSmall: {
            url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/120px!AIw2isGJrelqVJtsay-2dx8Wjg7y13BlsoouFI3s8yw0Vw",
            width: 120,
            height: 183,
          },
          small: {
            url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/240px!AIza6GPpMpyFnOKPIYmu7NRA9S5gwnsk-NYpy4tNkUEr-w",
            width: 240,
            height: 367,
          },
          medium: {
            url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/480px!AIx5DDlBC54gRtYW0p2OW42QwvqQNdw92mOYKNMd4aiOhw",
            width: 480,
            height: 733,
          },
          large: {
            url: "https://fbiinfo-present.dbc.dk/images/jQjA-H_HS5S-FxNpqpnyiQ/960px!AIzdYLXcAqtM-r9AdtHFGzGocxJsuoq7K_IH2kaqWfpwsA",
            width: 500,
            height: 764,
          },
        },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/120px!AIzklI-f3nfWc2SsF0YieOAAWMyK_PyjXHCEc9oCDgqFaA",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/120px!AIzklI-f3nfWc2SsF0YieOAAWMyK_PyjXHCEc9oCDgqFaA",
              width: 120,
              height: 184,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/240px!AIyhnMFlfbuuC8h9G4nYIDN05UqDxahNacK22JtK_jGkFg",
              width: 240,
              height: 367,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/480px!AIxk2GhN0_u_jP_g14qHnzu39G7mRjjrbQVxkfPAeIEt6A",
              width: 480,
              height: 734,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/960px!AIy64Se5Mm9JOmC9tmM7p6Jwp7MQGvY9s1nNkB9tP8i7hQ",
              width: 500,
              height: 765,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/L4djpf-0Tom2Ze50R6d2Jw/120px!AIzi-fuYQdqGoGsy4yiATWkR_gpsJ1P-ZudfHxOlY6XzIQ",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/L4djpf-0Tom2Ze50R6d2Jw/120px!AIzi-fuYQdqGoGsy4yiATWkR_gpsJ1P-ZudfHxOlY6XzIQ",
              width: 120,
              height: 185,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/L4djpf-0Tom2Ze50R6d2Jw/240px!AIwJNhserKnRwg0bE6iACv1D57c8-qvsMBN9Nkwdg1FQzQ",
              width: 240,
              height: 369,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/L4djpf-0Tom2Ze50R6d2Jw/480px!AIzVBth-5iWmaCOvsPErb7SxYOOxn3PwF2oy_ZmLxA-4tg",
              width: 480,
              height: 738,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/L4djpf-0Tom2Ze50R6d2Jw/960px!AIxacRMYrJmBvfInPLFq-RdgA1cG5vaskX3-nc-PrK8XgQ",
              width: 500,
              height: 769,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/y16lFjDHTBOFeeOt3kWq_Q/120px!AIxR-_XNMluQlkznNQ8CY5T2Trbt52Vz7n9OEpAlQpG6HQ",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/y16lFjDHTBOFeeOt3kWq_Q/120px!AIxR-_XNMluQlkznNQ8CY5T2Trbt52Vz7n9OEpAlQpG6HQ",
              width: 120,
              height: 162,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/y16lFjDHTBOFeeOt3kWq_Q/240px!AIw1U54VGNORiwmj6UFp1pcwcbKInYqZk9TXENo4t7HHqQ",
              width: 240,
              height: 324,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/y16lFjDHTBOFeeOt3kWq_Q/480px!AIx247lu0LjAcwK5eit4OluyqAVeliOn7THg2MepKp2p_A",
              width: 480,
              height: 648,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/y16lFjDHTBOFeeOt3kWq_Q/960px!AIxXlXEuT7ggMUsuPZUOa_adJ3YHJ_DRq0gqYFxNRGnXYw",
              width: 500,
              height: 675,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/8p-NnseFQE2btv140L_cmQ/120px!AIxo7h45SmpcoUDqoFxRRqwC0pOUU7GAJqHMQS4uTMb9Vw",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/8p-NnseFQE2btv140L_cmQ/120px!AIxo7h45SmpcoUDqoFxRRqwC0pOUU7GAJqHMQS4uTMb9Vw",
              width: 120,
              height: 193,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/8p-NnseFQE2btv140L_cmQ/240px!AIxW-D2S9nlNMwjHWK6ekJtHeNbwVcjKtp3joCrE6351jg",
              width: 240,
              height: 385,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/8p-NnseFQE2btv140L_cmQ/480px!AIwKDDnwONZ44B-RYYvGzTTLZKpurU5cvW0T3oCgwkwa7Q",
              width: 480,
              height: 771,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/8p-NnseFQE2btv140L_cmQ/960px!AIxjyYaQpqgkGRhBFDr91na2TlpnkL-HJgMGYEZfFMVkSA",
              width: 500,
              height: 803,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/moqnIyePQlCAtvQ33-dzyg/120px!AIz3OJIVaLYIC0WhcqEkam7_7EfNtXk13TxM3LItxpJcpA",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/moqnIyePQlCAtvQ33-dzyg/120px!AIz3OJIVaLYIC0WhcqEkam7_7EfNtXk13TxM3LItxpJcpA",
              width: 120,
              height: 175,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/moqnIyePQlCAtvQ33-dzyg/240px!AIwz7OUILRdSpLeKFKLgM33l4XBia23vMrkr1YaJCywbqw",
              width: 240,
              height: 351,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/moqnIyePQlCAtvQ33-dzyg/480px!AIx4JgAebIdAaWQTvGwP6YFW7-rfY8R8z5DArmSf-hF3ew",
              width: 480,
              height: 702,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/moqnIyePQlCAtvQ33-dzyg/960px!AIy8Jlq7hcLP0W2JlZSTtuydpeMcA3YRKEzkFBQhicZjfw",
              width: 500,
              height: 731,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/Rg5ZowLcRr2PPHG8qhVd_A/120px!AIxR30FoldjdjUGVWdKz7Y3MOavkd6Fgwwqhgpui-az57Q",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/Rg5ZowLcRr2PPHG8qhVd_A/120px!AIxR30FoldjdjUGVWdKz7Y3MOavkd6Fgwwqhgpui-az57Q",
              width: 120,
              height: 142,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/Rg5ZowLcRr2PPHG8qhVd_A/240px!AIwp_eYRkyuewbY7mdVeLqwvFLmY5n5Xdn6ECq4hlyLeew",
              width: 240,
              height: 283,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/Rg5ZowLcRr2PPHG8qhVd_A/480px!AIzygKpGIfp820q5lUpbYugPx_9ar3qYPIfbzcf03_HlLg",
              width: 480,
              height: 566,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/Rg5ZowLcRr2PPHG8qhVd_A/960px!AIx0UXevfUNI1ggYsqZnilgTdirurFXebLi-gfAvlcfHog",
              width: 500,
              height: 590,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/0bqaIUupTbCTy22R8IFQgw/120px!AIw_ZdDw3AAFirIz3z90IzdQUhQOPu-GeRt-0ubK7lw6ig",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/0bqaIUupTbCTy22R8IFQgw/120px!AIw_ZdDw3AAFirIz3z90IzdQUhQOPu-GeRt-0ubK7lw6ig",
              width: 120,
              height: 121,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/0bqaIUupTbCTy22R8IFQgw/240px!AIwgaU9nMOhwToXAUoculX02Ys-vcQxgGZKvXt51i1qChA",
              width: 240,
              height: 243,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/0bqaIUupTbCTy22R8IFQgw/480px!AIyeM2uzRXW1cIOjLE_7XyZ_8AUQTS-ijpWkAdwmSMuDRA",
              width: 480,
              height: 486,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/0bqaIUupTbCTy22R8IFQgw/960px!AIy38W3tXMewHV4C8MJYhDzXLAO9DNnvK7_RK-m9okkkuA",
              width: 500,
              height: 506,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/yeeiOXmdTzKfGT7TZK0duw/120px!AIy7lhqTntcwqPdPS5nmVTLh0o7EUavviB78t1mCFPqzjg",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/yeeiOXmdTzKfGT7TZK0duw/120px!AIy7lhqTntcwqPdPS5nmVTLh0o7EUavviB78t1mCFPqzjg",
              width: 120,
              height: 191,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/yeeiOXmdTzKfGT7TZK0duw/240px!AIxVn2Hy4FArMxUHeRe9s67TiTUG1hfpiBM9HTRuLckeKQ",
              width: 240,
              height: 382,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/yeeiOXmdTzKfGT7TZK0duw/480px!AIxQWNcZzGZI9ZTaynPcWN5Y7K9cGCj_rffscDwO_gHbRA",
              width: 480,
              height: 764,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/yeeiOXmdTzKfGT7TZK0duw/960px!AIw4zSRvKSN0-_K47zRgHN6pWIYH5AM93mT6acUX7bZFqA",
              width: 500,
              height: 796,
            },
          },
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
        cover: {
          thumbnail:
            "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/120px!AIzklI-f3nfWc2SsF0YieOAAWMyK_PyjXHCEc9oCDgqFaA",
          xSmall: {
            url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/120px!AIzklI-f3nfWc2SsF0YieOAAWMyK_PyjXHCEc9oCDgqFaA",
            width: 120,
            height: 184,
          },
          small: {
            url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/240px!AIyhnMFlfbuuC8h9G4nYIDN05UqDxahNacK22JtK_jGkFg",
            width: 240,
            height: 367,
          },
          medium: {
            url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/480px!AIxk2GhN0_u_jP_g14qHnzu39G7mRjjrbQVxkfPAeIEt6A",
            width: 480,
            height: 734,
          },
          large: {
            url: "https://fbiinfo-present.dbc.dk/images/xNYUKbuPSJexXM7J_Zpzeg/960px!AIy64Se5Mm9JOmC9tmM7p6Jwp7MQGvY9s1nNkB9tP8i7hQ",
            width: 500,
            height: 765,
          },
        },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/120px!AIxZhm3p2c-rP36lCLquF5khBFed21ZjCJQeWSkmWenKqg",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/120px!AIxZhm3p2c-rP36lCLquF5khBFed21ZjCJQeWSkmWenKqg",
              width: 120,
              height: 141,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/240px!AIyBl6kBhWPPBamgngL-Y3P6pblorcMY004LExT_GW8GeQ",
              width: 240,
              height: 282,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/480px!AIyL5bQ-MTtBJqUvtgKaEaRBxLfCZR2sFgENUcM4pGJbaA",
              width: 480,
              height: 564,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/960px!AIzNUgepw4VpSsn-N7b60VGcukCTiLKd7L1ZV9InNNvh2w",
              width: 960,
              height: 1129,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/oKob1sR5SgCNgo9zu5NrPw/120px!AIyA0KFWxkEWJrqABJx8bL2kZ_9WD_F0xf98xQrsS-B6_Q",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/oKob1sR5SgCNgo9zu5NrPw/120px!AIyA0KFWxkEWJrqABJx8bL2kZ_9WD_F0xf98xQrsS-B6_Q",
              width: 120,
              height: 192,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/oKob1sR5SgCNgo9zu5NrPw/240px!AIzQ9BupeN93RwWuBnAvIgRtRlzYPO412zQBs9kDmXekAQ",
              width: 240,
              height: 384,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/oKob1sR5SgCNgo9zu5NrPw/480px!AIxGlfUG_7XyIN8ME5DobhmCVMyEqGsAHT4qloDPDocekQ",
              width: 480,
              height: 768,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/oKob1sR5SgCNgo9zu5NrPw/960px!AIyoM81NM8qbSxQAmTCWql6UVpDrG8KmqJzVyv5Add7RZw",
              width: 500,
              height: 800,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/DyBf9dB3T12xrm7-aaE4KQ/120px!AIz3M3VljtS2yv_425YWjgmwSgYUyGFx9tsXBbIUEd4S0w",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/DyBf9dB3T12xrm7-aaE4KQ/120px!AIz3M3VljtS2yv_425YWjgmwSgYUyGFx9tsXBbIUEd4S0w",
              width: 120,
              height: 185,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/DyBf9dB3T12xrm7-aaE4KQ/240px!AIxuK6czfRlicWPf9LhhiuW1SUBATgFX9kGAjDQ8Gl0eyg",
              width: 240,
              height: 370,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/DyBf9dB3T12xrm7-aaE4KQ/480px!AIzqsl1CGoMvIvAn-exLnF4HyqCnlAU_xP8ETcA9h9NCYw",
              width: 480,
              height: 739,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/DyBf9dB3T12xrm7-aaE4KQ/960px!AIzT5KRk7ZSNQ9-Et1NatyIDsgY6TbL1VVEehi6TTyOxJQ",
              width: 500,
              height: 770,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/DQU06NYSTUiBSPnfFzj2ag/120px!AIy2b_x7QD8Bkk3Xit_LY6l3FU5uLzskTnm8XSFezPqZhA",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/DQU06NYSTUiBSPnfFzj2ag/120px!AIy2b_x7QD8Bkk3Xit_LY6l3FU5uLzskTnm8XSFezPqZhA",
              width: 120,
              height: 195,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/DQU06NYSTUiBSPnfFzj2ag/240px!AIwXLoaG3EL8Uu4adzRKInewXYCpiZhWA-WmHTWVLk_R1A",
              width: 240,
              height: 390,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/DQU06NYSTUiBSPnfFzj2ag/480px!AIzETDN1kYGxhRXeZ9lMhh2XrejbcN2fbI8QOoxH7cUu0Q",
              width: 480,
              height: 780,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/DQU06NYSTUiBSPnfFzj2ag/960px!AIyLCGAd-T67xrdbO2iMAWtnJXvT7EkMASdl4etHRLU2Ew",
              width: 500,
              height: 812,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/tglJt5zQRhW2KMaHtkeyfQ/120px!AIxjEei5hyqlIaESUrMODorbU4GFgYyaemrWb260X4uQ4g",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/tglJt5zQRhW2KMaHtkeyfQ/120px!AIxjEei5hyqlIaESUrMODorbU4GFgYyaemrWb260X4uQ4g",
              width: 120,
              height: 176,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/tglJt5zQRhW2KMaHtkeyfQ/240px!AIwxSdhG0FSJtVI8RLEIrlFR6ctDZlR9a5L7QOWWeMpMMg",
              width: 240,
              height: 352,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/tglJt5zQRhW2KMaHtkeyfQ/480px!AIzYQY3OIbEEzAGbzgiVgCf_wx4kE0HpblJUl4c3UaHNOA",
              width: 480,
              height: 704,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/tglJt5zQRhW2KMaHtkeyfQ/960px!AIwjtv_2FQzbdnfWhLRnsyT3oYG53RQN_e12VpIpi2mEkg",
              width: 500,
              height: 733,
            },
          },
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
        cover: {
          thumbnail:
            "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/120px!AIxZhm3p2c-rP36lCLquF5khBFed21ZjCJQeWSkmWenKqg",
          xSmall: {
            url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/120px!AIxZhm3p2c-rP36lCLquF5khBFed21ZjCJQeWSkmWenKqg",
            width: 120,
            height: 141,
          },
          small: {
            url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/240px!AIyBl6kBhWPPBamgngL-Y3P6pblorcMY004LExT_GW8GeQ",
            width: 240,
            height: 282,
          },
          medium: {
            url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/480px!AIyL5bQ-MTtBJqUvtgKaEaRBxLfCZR2sFgENUcM4pGJbaA",
            width: 480,
            height: 564,
          },
          large: {
            url: "https://fbiinfo-present.dbc.dk/images/F0gAweyoRyiW4SVifJ5JIA/960px!AIzNUgepw4VpSsn-N7b60VGcukCTiLKd7L1ZV9InNNvh2w",
            width: 960,
            height: 1129,
          },
        },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/120px!AIyv0Wwt6jnsI-7vrN3MmycCAi8ujT5FXB0OI9XvEYoLAA",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/120px!AIyv0Wwt6jnsI-7vrN3MmycCAi8ujT5FXB0OI9XvEYoLAA",
              width: 120,
              height: 178,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/240px!AIw__YYla_lXFWXjd1_a-Rlg94dWf2LdvAHni_Z4nozjzg",
              width: 240,
              height: 355,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/480px!AIzqXchw9KhoCo75LdbCgepuyULa07lm8gSvknwFbAtuwQ",
              width: 480,
              height: 710,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/960px!AIx6t9m9V_8Zi2naBTA9SAyO8AEtI4i32sQ5QYEMBeF-Cw",
              width: 500,
              height: 740,
            },
          },
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
          cover: {
            thumbnail:
              "https://default-forsider.dbc.dk/thumbnail/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXRsZSI6IkF0bGFzIChtcDMpIiwibWF0ZXJpYWxUeXBlIjoiQVVESU9fQk9PS1MiLCJpYXQiOjE3NDc3NTQwNDl9.0s_YZmvwj93ZyqGfUYjN8XL1vvaSolKYyCtbJdTXcPQ",
            xSmall: {
              url: "https://default-forsider.dbc.dk/thumbnail/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXRsZSI6IkF0bGFzIChtcDMpIiwibWF0ZXJpYWxUeXBlIjoiQVVESU9fQk9PS1MiLCJpYXQiOjE3NDc3NTQwNDl9.0s_YZmvwj93ZyqGfUYjN8XL1vvaSolKYyCtbJdTXcPQ",
              width: 75,
              height: 115,
            },
            small: {
              url: "https://default-forsider.dbc.dk/large/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXRsZSI6IkF0bGFzIChtcDMpIiwibWF0ZXJpYWxUeXBlIjoiQVVESU9fQk9PS1MiLCJpYXQiOjE3NDc3NTQwNDl9.0s_YZmvwj93ZyqGfUYjN8XL1vvaSolKYyCtbJdTXcPQ",
              width: 300,
              height: 460,
            },
            medium: {
              url: "https://default-forsider.dbc.dk/large/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXRsZSI6IkF0bGFzIChtcDMpIiwibWF0ZXJpYWxUeXBlIjoiQVVESU9fQk9PS1MiLCJpYXQiOjE3NDc3NTQwNDl9.0s_YZmvwj93ZyqGfUYjN8XL1vvaSolKYyCtbJdTXcPQ",
              width: 300,
              height: 460,
            },
            large: {
              url: "https://default-forsider.dbc.dk/large/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0aXRsZSI6IkF0bGFzIChtcDMpIiwibWF0ZXJpYWxUeXBlIjoiQVVESU9fQk9PS1MiLCJpYXQiOjE3NDc3NTQwNDl9.0s_YZmvwj93ZyqGfUYjN8XL1vvaSolKYyCtbJdTXcPQ",
              width: 300,
              height: 460,
            },
          },
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
        cover: {
          thumbnail:
            "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/120px!AIyv0Wwt6jnsI-7vrN3MmycCAi8ujT5FXB0OI9XvEYoLAA",
          xSmall: {
            url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/120px!AIyv0Wwt6jnsI-7vrN3MmycCAi8ujT5FXB0OI9XvEYoLAA",
            width: 120,
            height: 178,
          },
          small: {
            url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/240px!AIw__YYla_lXFWXjd1_a-Rlg94dWf2LdvAHni_Z4nozjzg",
            width: 240,
            height: 355,
          },
          medium: {
            url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/480px!AIzqXchw9KhoCo75LdbCgepuyULa07lm8gSvknwFbAtuwQ",
            width: 480,
            height: 710,
          },
          large: {
            url: "https://fbiinfo-present.dbc.dk/images/kciKAJeNTh6NnkZNlOUDHg/960px!AIx6t9m9V_8Zi2naBTA9SAyO8AEtI4i32sQ5QYEMBeF-Cw",
            width: 500,
            height: 740,
          },
        },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/pNw7hv4CS227sp68DsqdZA/120px!AIzKEbdvZCKM9XelkxonAxxsvnrxF8d1l0PEs_52iCNfcQ",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/pNw7hv4CS227sp68DsqdZA/120px!AIzKEbdvZCKM9XelkxonAxxsvnrxF8d1l0PEs_52iCNfcQ",
              width: 120,
              height: 120,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/pNw7hv4CS227sp68DsqdZA/240px!AIyugH1Vh4WoVbla2a_fj44WzB9GXH8EIo5zJPT9fRMEiQ",
              width: 240,
              height: 241,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/pNw7hv4CS227sp68DsqdZA/480px!AIzYSnkpWcsgJD_UVRUHOwAxl4DwUEH5eT5vI5gptd2DrA",
              width: 480,
              height: 482,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/pNw7hv4CS227sp68DsqdZA/960px!AIwPVFa0AEVn8xVA9qsZ74bCua7U_Bx5KMrJy2kaIrSE8w",
              width: 500,
              height: 502,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/WYaUfMQBT8qU7uLWdJy29g/120px!AIyNRiwtUUJamLvO0M3tar8UuqSj-4R4zpxE7bYXdfgzHA",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/WYaUfMQBT8qU7uLWdJy29g/120px!AIyNRiwtUUJamLvO0M3tar8UuqSj-4R4zpxE7bYXdfgzHA",
              width: 120,
              height: 176,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/WYaUfMQBT8qU7uLWdJy29g/240px!AIw9hTavRiqUFh8VYd30fm72gzHnV48-5bgzmRbWodAR7w",
              width: 240,
              height: 351,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/WYaUfMQBT8qU7uLWdJy29g/480px!AIzNsJDDTjrSiAGQmmbq9BKbtUQat1yjwEvyDA7LpUuukg",
              width: 480,
              height: 703,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/WYaUfMQBT8qU7uLWdJy29g/960px!AIyKmq1j3N3UTd8CV774li4j5INWdDuT3UN4qmhj6Cb92g",
              width: 500,
              height: 732,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/-ouIJoSLRQSpaTM9kVi_MA/120px!AIzKvp0WJ53a4qfZGM5BDoAJc-fQs2CCxHNmfmsfoTT5Fg",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/-ouIJoSLRQSpaTM9kVi_MA/120px!AIzKvp0WJ53a4qfZGM5BDoAJc-fQs2CCxHNmfmsfoTT5Fg",
              width: 120,
              height: 185,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/-ouIJoSLRQSpaTM9kVi_MA/240px!AIzI1360sDyUfnotKWc3YUEVylPfM0ZkquOlcEeKPbIl8A",
              width: 240,
              height: 370,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/-ouIJoSLRQSpaTM9kVi_MA/480px!AIyNuc48uxiJNWNW356tlv_HtzB3hWZj-kgYJw1kDbMm3Q",
              width: 480,
              height: 739,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/-ouIJoSLRQSpaTM9kVi_MA/960px!AIy_aACJQTWo8dbb-YM3IGDPCdJ8sqN5tDGmdalxtoY7cQ",
              width: 500,
              height: 770,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/120px!AIw_gB1h7aoSZBW9IUr8QAIa9SPUqUUJtcZvY11dGnFBiw",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/120px!AIw_gB1h7aoSZBW9IUr8QAIa9SPUqUUJtcZvY11dGnFBiw",
              width: 120,
              height: 191,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/240px!AIzj4Mp7YuYu1MwecQZi3OZ-qzceu91Dl1NWafrY3l7pzA",
              width: 240,
              height: 382,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/480px!AIxL7UtKSNCRnydKzjcciY0tA0KYIjoPTydCsk9pPCj1tA",
              width: 480,
              height: 764,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/960px!AIz4Xt-ay4hkzDoLiJqzBaXEtPOlkykZ-X-cdnvS-eZpUw",
              width: 500,
              height: 796,
            },
          },
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
          cover: {
            thumbnail:
              "https://fbiinfo-present.dbc.dk/images/JLmo-asXSy60ai58D50hAQ/120px!AIyjmXU320UVylOcJ5-8tExXwoQFsQFoTWxMa_q_tWsRpw",
            xSmall: {
              url: "https://fbiinfo-present.dbc.dk/images/JLmo-asXSy60ai58D50hAQ/120px!AIyjmXU320UVylOcJ5-8tExXwoQFsQFoTWxMa_q_tWsRpw",
              width: 120,
              height: 190,
            },
            small: {
              url: "https://fbiinfo-present.dbc.dk/images/JLmo-asXSy60ai58D50hAQ/240px!AIy20aAu3J1ULtZc2kAifr27r-mRStDTFR_lIstLm8-iNg",
              width: 240,
              height: 380,
            },
            medium: {
              url: "https://fbiinfo-present.dbc.dk/images/JLmo-asXSy60ai58D50hAQ/480px!AIzbEdpL-0FY0zyfNaruJCUdVYab6d-7gJxQFCEayanO1w",
              width: 480,
              height: 759,
            },
            large: {
              url: "https://fbiinfo-present.dbc.dk/images/JLmo-asXSy60ai58D50hAQ/960px!AIw2psNGzBy7YvUMKOMww5QLKhcTRdazSEMpGEtKLfFVnA",
              width: 500,
              height: 791,
            },
          },
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
        cover: {
          thumbnail:
            "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/120px!AIw_gB1h7aoSZBW9IUr8QAIa9SPUqUUJtcZvY11dGnFBiw",
          xSmall: {
            url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/120px!AIw_gB1h7aoSZBW9IUr8QAIa9SPUqUUJtcZvY11dGnFBiw",
            width: 120,
            height: 191,
          },
          small: {
            url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/240px!AIzj4Mp7YuYu1MwecQZi3OZ-qzceu91Dl1NWafrY3l7pzA",
            width: 240,
            height: 382,
          },
          medium: {
            url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/480px!AIxL7UtKSNCRnydKzjcciY0tA0KYIjoPTydCsk9pPCj1tA",
            width: 480,
            height: 764,
          },
          large: {
            url: "https://fbiinfo-present.dbc.dk/images/Mj-nLqakSVm2P4-W4mrtkQ/960px!AIz4Xt-ay4hkzDoLiJqzBaXEtPOlkykZ-X-cdnvS-eZpUw",
            width: 500,
            height: 796,
          },
        },
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
