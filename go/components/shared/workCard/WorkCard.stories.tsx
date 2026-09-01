import type { Meta, StoryObj } from "@storybook/nextjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import WorkCard from "@/components/shared/workCard/WorkCard"
import { getGetV1ProductsIdentifierAdapterQueryKey } from "@/lib/rest/publizon/adapter/generated/publizon"

import { worksMock } from "../../paragraphs/VideoBundle/VideoBundle.mockData"

// worksMock has the variation the stories need: a two-type work (e-book +
// book), a single-type physical book, and three-type works (e-book,
// audiobook, book).
const [twoTypes, oneType, threeTypes, blueTitle] = worksMock

const cardArgs = (work: (typeof worksMock)[number]) => ({
  workId: work.workId,
  title: work.titles.full[0],
  manifestations: work.manifestations.all,
  bestRepresentation: work.manifestations.bestRepresentation,
})

const client = new QueryClient({
  defaultOptions: { queries: { retry: false, staleTime: Infinity } },
})

// Seed the blue-title work's products as cost-free ("BLÅ") so the card
// renders the badge without hitting Publizon.
blueTitle.manifestations.all.forEach(manifestation =>
  manifestation.identifiers.forEach(identifier =>
    client.setQueryData(getGetV1ProductsIdentifierAdapterQueryKey(identifier.value), {
      product: { costFree: true },
    })
  )
)

const withQueryClient = (Story: React.ComponentType): React.ReactElement => (
  <QueryClientProvider client={client}>
    <Story />
  </QueryClientProvider>
)

// The card used across sliders and search results: cover on the overlay
// background with material-type icons along the bottom.
const meta = {
  title: "components/WorkCard",
  component: WorkCard,
  parameters: { layout: "centered" },
  args: cardArgs(twoTypes),
  decorators: [withQueryClient],
} satisfies Meta<typeof WorkCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <div className="w-96 p-10">
      <WorkCard {...args} />
    </div>
  ),
}

// The card scales with its container; the icon row and title keep up. The
// widths match real render sites: sliders and search results on desktop.
export const Sizes: Story = {
  render: args => (
    <div className="flex items-end gap-10 p-10">
      {(
        [
          ["w-72", "Slider card"],
          ["w-[420px]", "Search results, desktop"],
        ] as const
      ).map(([width, description]) => (
        <ShowcaseItem key={width} title={width} description={description}>
          <div className={width}>
            <WorkCard {...args} />
          </div>
        </ShowcaseItem>
      ))}
    </div>
  ),
}

// One, two and three material types in the icon row along the bottom.
export const MaterialTypes: Story = {
  render: () => (
    <div className="flex items-end gap-10 p-10">
      <ShowcaseItem title="one type" description="Physical book only">
        <div className="w-72">
          <WorkCard {...cardArgs(oneType)} />
        </div>
      </ShowcaseItem>
      <ShowcaseItem title="two types" description="E-book and book">
        <div className="w-72">
          <WorkCard {...cardArgs(twoTypes)} />
        </div>
      </ShowcaseItem>
      <ShowcaseItem title="three types" description="E-book, audiobook and book">
        <div className="w-72">
          <WorkCard {...cardArgs(threeTypes)} />
        </div>
      </ShowcaseItem>
    </div>
  ),
}

// Cost-free ("BLÅ") titles get the badge in the top left corner.
export const BlueTitle: Story = {
  render: () => (
    <div className="w-96 p-10">
      <WorkCard {...cardArgs(blueTitle)} />
    </div>
  ),
}

// The tilt animation used when cards scroll into view in sliders.
export const WithTilt: Story = {
  args: { isWithTilt: true },
  render: args => (
    <div className="w-96 p-10">
      <WorkCard {...args} />
    </div>
  ),
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="w-96 p-10">
      <WorkCard {...args} />
    </div>
  ),
}
