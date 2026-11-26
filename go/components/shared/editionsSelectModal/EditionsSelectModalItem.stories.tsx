import { ServiceLayerProvider } from "@danskernesdigitalebibliotek/dpl-service-layer"
import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React, { useState } from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import {
  buildCover,
  buildEdition,
  buildEditions,
  storyServiceLayerConfig,
} from "@/components/shared/editionsSelectModal/stories.fixtures"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

const editions = buildEditions()

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

// A card on its own, at the width the modal's narrowest column gives it.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-background w-72 p-8">{children}</div>
)

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState("pid-1")
    return (
      <Frame>
        <EditionsSelectModalItem
          manifestation={editions[0]}
          name="story-edition"
          checked={checked === "pid-1"}
          onSelect={() => setChecked("pid-1")}
        />
      </Frame>
    )
  },
}

// A long publisher name wraps, which is what decides the card's height.
export const LongPublisher: Story = {
  render: () => (
    <Frame>
      <EditionsSelectModalItem
        manifestation={buildEdition({
          pid: "long",
          cover: buildCover(420, 720),
          publisher: ["Et meget langt forlagsnavn der fylder flere linjer i kortet"],
        })}
        name="story-long"
        checked={false}
        onSelect={() => {}}
      />
    </Frame>
  ),
}

// An edition that cannot be borrowed right now still renders its status.
export const Unavailable: Story = {
  render: () => (
    <Frame>
      <EditionsSelectModalItem
        manifestation={editions[0]}
        name="story-unavailable"
        checked={false}
        onSelect={() => {}}
        unavailableLabel={
          <StatusLabel variant="warning" subline="Du er nr. 3 i køen" className="w-full">
            Udlånt lige nu
          </StatusLabel>
        }
        unavailableText="Udlånt lige nu"
      />
    </Frame>
  ),
}

// Audio swaps the page count for a running time, and a square cover.
export const Audiobook: Story = {
  render: () => (
    <Frame>
      <EditionsSelectModalItem
        manifestation={buildEdition({
          pid: "audio",
          cover: buildCover(500, 500),
          materialTypes: [
            {
              materialTypeGeneral: { code: "AUDIO_BOOKS", display: "lydbøger" },
              materialTypeSpecific: { code: "AUDIO_BOOK", display: "lydbog" },
            },
          ],
          physicalDescription: { summaryFull: "2 t., 14 min.", numberOfPages: null },
        } as Partial<ManifestationWorkPageFragment>)}
        name="story-audio"
        checked={false}
        onSelect={() => {}}
      />
    </Frame>
  ),
}

// Every detail row keeps its place when the record has no value for it.
export const MissingDetails: Story = {
  render: () => (
    <Frame>
      <EditionsSelectModalItem
        manifestation={buildEdition({
          pid: "sparse",
          cover: buildCover(420, 720),
          publisher: [],
          physicalDescription: { summaryFull: null, numberOfPages: null },
        } as Partial<ManifestationWorkPageFragment>)}
        name="story-sparse"
        checked={false}
        onSelect={() => {}}
      />
    </Frame>
  ),
}

export const Skeleton: Story = {
  render: () => (
    <Frame>
      <EditionsSelectModalItem.Skeleton />
    </Frame>
  ),
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: () => (
    <Frame>
      <EditionsSelectModalItem
        manifestation={editions[0]}
        name="story-dark"
        checked
        onSelect={() => {}}
      />
    </Frame>
  ),
}
