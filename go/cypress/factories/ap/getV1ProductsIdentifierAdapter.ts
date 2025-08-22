import { Factory } from "fishery"

import { ProductResult } from "@/lib/rest/publizon/adapter/generated/model"

export default Factory.define<ProductResult>(({}) => {
  return {
    product: {
      createdUtc: "2025-05-05T09:35:30.027Z",
      updatedUtc: "2025-05-05T09:43:49.693Z",
      title: "Lullus dagbog 6, Helt desperado - med flere drenge! Rød Læseklub",
      isActive: true,
      languageCode: "dan",
      coverUri: "https://images.pubhub.dk/01/26e9f3cc-bf1b-4951-bad6-381b415c07b4.jpg",
      thumbnailUri: "https://images.pubhub.dk/27/26e9f3cc-bf1b-4951-bad6-381b415c07b4.jpg",
      sampleUri: "http://samples.pubhub.dk/9788727269467.mp3",
      productType: 2,
      externalProductId: {
        idType: 15,
        id: "8788711917141",
      },
      internalProductId: "26e9f3cc-bf1b-4951-bad6-381b415c07b4",
      contributors: [
        {
          type: "A01",
          firstName: "Anette Vinther",
          lastName: "Jensen",
        },
        {
          type: "E07",
          firstName: "Anne",
          lastName: "Blomsgård",
        },
      ],
      format: "zip",
      fileSizeInBytes: 50122,
      durationInSeconds: 4227,
      publisher: "SAGA Egmont",
      publicationDate: "2025-05-02T00:00:00Z",
      description:
        "<p>Vitus var helt rød i ansigtet. Det var jeg også. Jeg var SÅ FLOV, at jeg troede, at jeg skulle dø af skam. Det tror jeg godt, man kan. Mit hjerte stod i hvert fald helt stille. Og mine muskler var også lammet. Jeg ville sige noget. Men som sagt, jeg var i chok. Så jeg kunne ingenting sige. Og så gik han.</p><p>Lullu vil have et kys. Af Vitus. De har ikke set hinanden hele sommeren, men nu er han endelig hjemme. Hvorfor har de så ikke kysset endnu? Lullu ønsker sig også en ny bluse. Men må hun få en? NEJ. Alt handler om tvillingerne.</p><p>Anette Vinther Jensen er forfatter til en lang række bøger og letlæsningsbøger for børn og unge, blandt andet gyseren ”Dødens fjer”, der henvender sig til de 12-15-årige, og bøgerne om Lullu til de 9-13-årige.</p>",
      productCategories: [
        {
          description: "Danmark",
          code: "1DND",
        },
        {
          description: "Tidlige 21. århundrede, 2000 til 2050",
          code: "3MRB",
        },
        {
          description: "Alderstrin: fra 9 år",
          code: "5AK",
        },
        {
          description: "Skønlitteratur for børn og unge: generel skønlitteratur",
          code: "YFB",
        },
        {
          description: "Children’s / Teenage fiction: Friendship stories",
          code: "YFMF",
        },
        {
          description: "Children’s / Teenage fiction: Romance and love stories",
          code: "YFMR",
        },
        {
          description: "Skønlitteratur for børn og unge: familien og hjemmet",
          code: "YFN",
        },
        {
          description: "Skønlitteratur for børn og unge: skolehistorier",
          code: "YFS",
        },
      ],
      costFree: false,
    },
    code: 101,
    message: "OK (#101).",
  }
})
