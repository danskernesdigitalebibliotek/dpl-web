import { type ServiceLayerConfig } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { placeholderImageUrl } from "@/cypress/factories/placeholder-image"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// Shared by the modal's and the item's stories, so the two cannot drift.

// Covers in varying proportions, against the card's one fixed box ratio.
export const buildCover = (width: number, height: number) => {
  const url = placeholderImageUrl(width, height)
  return coverFactory.build({
    thumbnail: url,
    xSmall: { url, width, height },
    small: { url, width, height },
    medium: { url, width, height },
    large: { url, width, height },
  })
}

export const buildEdition = (
  overrides: Partial<ManifestationWorkPageFragment> = {}
): ManifestationWorkPageFragment =>
  ({
    ...eBookManifestationFactory.build(),
    titles: {
      full: ["Tro på det, Theo. Bind 1"],
      main: ["Tro på det, Theo"],
      identifyingAddition: null,
    },
    publisher: ["Gutkind"],
    physicalDescription: { summaryFull: "144 sider, ill. i farver", numberOfPages: 144 },
    edition: {
      publicationYear: { display: "2023", year: 2023 },
      edition: "1. udgave",
      summary: "1. udgave, 2023",
    },
    ...overrides,
  }) as ManifestationWorkPageFragment

// Three editions with their own pid, material id, year, publisher and cover
// proportions.
export const buildEditions = (): ManifestationWorkPageFragment[] => [
  buildEdition({
    pid: "pid-1",
    cover: buildCover(420, 720),
    identifiers: [
      { type: "PUBLIZON", value: "9788762722881" },
      { type: "ISBN", value: "9788762722881" },
    ],
  }),
  buildEdition({
    pid: "pid-2",
    cover: buildCover(660, 720),
    publisher: ["Gyldendalske Boghandel, Nordisk Forlag"],
    identifiers: [
      { type: "PUBLIZON", value: "9788762722882" },
      { type: "ISBN", value: "9788762722882" },
    ],
    edition: {
      publicationYear: { display: "2019", year: 2019 },
      edition: "2. udgave",
      summary: "2. udgave, 2019",
    },
  }),
  buildEdition({
    pid: "pid-3",
    cover: buildCover(500, 720),
    identifiers: [
      { type: "PUBLIZON", value: "9788762722883" },
      { type: "ISBN", value: "9788762722883" },
    ],
    edition: {
      publicationYear: { display: "2008", year: 2008 },
      edition: "3. udgave",
      summary: "3. udgave, 2008",
    },
  }),
]

// The cards read blue-title state through the service layer.
export const storyServiceLayerConfig: ServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer story-token",
}

export const getMaterialId = (manifestation: ManifestationWorkPageFragment) =>
  manifestation.identifiers?.find(identifier => identifier.type === "PUBLIZON")?.value as string
