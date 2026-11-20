import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"
import { eBookManifestationFactory } from "@/cypress/factories/fbi/factory-parts/manifestations"
import { placeholderImageUrl } from "@/cypress/factories/placeholder-image"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// Real covers come in varying proportions. The card's box is one fixed ratio,
// so these are what prove the grid still lines up.
const buildCover = (width: number, height: number) => {
  const url = placeholderImageUrl(width, height)
  return coverFactory.build({
    thumbnail: url,
    xSmall: { url, width, height },
    small: { url, width, height },
    medium: { url, width, height },
    large: { url, width, height },
  })
}

const buildEdition = (
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

const editions = [
  buildEdition({ pid: "pid-1", cover: buildCover(420, 720) }),
  buildEdition({
    pid: "pid-2",
    cover: buildCover(660, 720),
    publisher: ["Gyldendalske Boghandel"],
    edition: {
      publicationYear: { display: "2019", year: 2019 },
      edition: "2. udgave",
      summary: "2. udgave, 2019",
    },
  }),
  buildEdition({
    pid: "pid-3",
    cover: buildCover(500, 720),
    edition: {
      publicationYear: { display: "2008", year: 2008 },
      edition: "3. udgave",
      summary: "3. udgave, 2008",
    },
  }),
]

// The card reads blue-title state through the service layer, so its hooks
// need the provider.
const storyServiceLayerConfig = {
  getBaseUrl: () => "https://biblio.example",
  getAuthHeader: () => "Bearer story-token",
}

const withProviders = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={new QueryClient()}>
    <ServiceLayerProvider config={storyServiceLayerConfig}>
      <Story />
    </ServiceLayerProvider>
  </QueryClientProvider>
)

const meta = {
  title: "components/EditionsSelectModalItem",
  component: EditionsSelectModalItem,
  decorators: [withProviders],
  args: {
    manifestation: editions[0],
    name: "story-edition",
    checked: true,
    onSelect: () => {},
  },
} satisfies Meta<typeof EditionsSelectModalItem>

export default meta
type Story = StoryObj<typeof meta>

// The grid the modal itself renders, so the cards are seen as a row rather
// than in isolation — which is where misaligned covers would show up.
const Grid = () => {
  const [checked, setChecked] = useState("pid-1")
  return (
    <div className="bg-background max-w-3xl p-8">
      <div data-equal-row-container className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3">
        {editions.map(edition => (
          <EditionsSelectModalItem
            key={edition.pid}
            manifestation={edition}
            name="story-edition"
            checked={checked === edition.pid}
            onSelect={() => setChecked(edition.pid)}
          />
        ))}
      </div>
    </div>
  )
}

export const Default: Story = {
  render: () => <Grid />,
}

// A single card, for looking at the detail rows on their own.
export const Single: Story = {
  render: () => (
    <div className="bg-background w-60 p-8">
      <EditionsSelectModalItem
        manifestation={editions[0]}
        name="story-single"
        checked
        onSelect={() => {}}
      />
    </div>
  ),
}

// An edition that cannot be borrowed right now still renders its status.
export const Unavailable: Story = {
  render: () => (
    <div className="bg-background w-60 p-8">
      <EditionsSelectModalItem
        manifestation={editions[0]}
        name="story-unavailable"
        checked={false}
        onSelect={() => {}}
        unavailableLabel={<StatusLabel variant="warning">Udlånt lige nu</StatusLabel>}
        unavailableText="Udlånt lige nu"
      />
    </div>
  ),
}

// Six cards over two rows, the first row carrying a long publisher and a
// status label: proves each row sizes to its own tallest card rather than to
// the tallest card in the grid.
export const Rows: Story = {
  render: () => (
    <div className="bg-background max-w-3xl p-8">
      <div data-equal-row-container className="flex flex-wrap gap-x-[2%] gap-y-7 [&>*]:w-[32%]">
        <EditionsSelectModalItem
          manifestation={editions[1]}
          name="story-rows"
          checked={false}
          onSelect={() => {}}
          unavailableLabel={
            <StatusLabel variant="warning" subline="Du er nr. 3 i køen" className="w-full">
              Udlånt lige nu
            </StatusLabel>
          }
          unavailableText="Udlånt lige nu"
        />
        {editions.slice(0, 2).map((edition, i) => (
          <EditionsSelectModalItem
            key={`top-${i}`}
            manifestation={edition}
            name="story-rows"
            checked={false}
            onSelect={() => {}}
          />
        ))}
        {editions.map((edition, i) => (
          <EditionsSelectModalItem
            key={`bottom-${i}`}
            manifestation={edition}
            name="story-rows"
            checked={false}
            onSelect={() => {}}
          />
        ))}
      </div>
    </div>
  ),
}

// The modal's own wrapper classes, so the breakpoint behaviour can be seen
// where it actually applies rather than in a synthetic probe.
export const ModalGrid: Story = {
  render: () => (
    <div className="bg-background px-grid-edge py-6 lg:px-10">
      <div
        data-equal-row-container
        className="flex flex-wrap gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-7 [&>*]:w-full
          sm:[&>*]:w-[calc(50%-(var(--spacing)*3))] md:[&>*]:w-[calc(33.333%-(var(--spacing)*4))]
          lg:[&>*]:w-[calc(50%-(var(--spacing)*3))]">
        {[...editions, ...editions].map((edition, i) => (
          <EditionsSelectModalItem
            key={i}
            manifestation={edition}
            name="story-modalgrid"
            checked={false}
            onSelect={() => {}}
          />
        ))}
      </div>
    </div>
  ),
}

// Row 1 has one very tall card (a long publisher plus a status label) and two
// short ones; row 2 is uniformly short. If rows size independently, row 2 stays
// short and the short cards in row 1 do NOT inherit row 2's height.
export const UnevenRows: Story = {
  render: () => {
    const tall = buildEdition({
      pid: "tall",
      cover: buildCover(420, 720),
      publisher: ["Et meget langt forlagsnavn der fylder flere linjer i kortet"],
    })
    const short = buildEdition({ pid: "short", cover: buildCover(660, 720), publisher: ["Kort"] })
    return (
      <div className="bg-background p-8">
        <div
          data-equal-row-container
          className="flex flex-wrap gap-x-6 gap-y-7 [&>*]:w-[calc(33.333%-(var(--spacing)*4))]">
          <EditionsSelectModalItem
            manifestation={tall}
            name="story-uneven"
            checked={false}
            onSelect={() => {}}
            unavailableLabel={
              <StatusLabel variant="warning" subline="Du er nr. 3 i køen" className="w-full">
                Udlånt lige nu
              </StatusLabel>
            }
            unavailableText="Udlånt lige nu"
          />
          {["a", "b", "c", "d", "e"].map(key => (
            <EditionsSelectModalItem
              key={key}
              manifestation={short}
              name="story-uneven"
              checked={false}
              onSelect={() => {}}
            />
          ))}
        </div>
      </div>
    )
  },
}

// An audiobook row as the data actually arrives: one edition with a running
// time, one with none, one with no publisher. Rows that drop out leave the
// lists with different numbers of rows, which is what pulls a row apart.
export const AudiobookRow: Story = {
  render: () => {
    const audio = (pid: string, overrides: Partial<ManifestationWorkPageFragment> = {}) =>
      buildEdition({
        pid,
        cover: buildCover(500, 500),
        materialTypes: [
          {
            materialTypeGeneral: { code: "AUDIO_BOOKS", display: "lydbøger" },
            materialTypeSpecific: { code: "AUDIO_BOOK", display: "lydbog" },
          },
        ],
        ...overrides,
      } as Partial<ManifestationWorkPageFragment>)

    const editions = [
      audio("a1", {
        physicalDescription: { summaryFull: "2 t., 14 min.", numberOfPages: null },
      }),
      audio("a2", {
        // No running time: the "Varighed" row drops out entirely.
        physicalDescription: { summaryFull: null, numberOfPages: null },
      }),
      audio("a3", {
        publisher: [],
        physicalDescription: { summaryFull: "5 t., 3 min.", numberOfPages: null },
      }),
    ]

    return (
      <div className="bg-background px-grid-edge py-6 lg:px-10">
        <div
          data-equal-row-container
          className="flex flex-wrap gap-x-6 gap-y-7 [&>*]:w-[calc(33.333%-(var(--spacing)*4))]">
          {editions.map(edition => (
            <EditionsSelectModalItem
              key={edition.pid}
              manifestation={edition}
              name="story-audio"
              checked={false}
              onSelect={() => {}}
            />
          ))}
        </div>
      </div>
    )
  },
}

export const Skeleton: Story = {
  render: () => (
    <div className="bg-background max-w-3xl p-8">
      <div data-equal-row-container className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3">
        <EditionsSelectModalItem.Skeleton />
        <EditionsSelectModalItem.Skeleton />
        <EditionsSelectModalItem.Skeleton />
      </div>
    </div>
  ),
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: () => <Grid />,
}
