import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import WorkCard from "@/components/shared/workCard/WorkCard"
import { getWorkCardMaterialTypes } from "@/components/shared/workCard/helper"

import { worksMock } from "../../paragraphs/VideoBundle/VideoBundle.mockData"

// worksMock has the variation the stories need: a two-type work (e-book +
// book), a single-type physical book, and three-type works (e-book,
// audiobook, book).
const [twoTypes, oneType, threeTypes, blueTitle] = worksMock

// isBlueTitle marks every material type as cost-free, as Publizon would for "BLÅ" titles.
const cardArgs = (work: (typeof worksMock)[number], isBlueTitle = false) => ({
  title: work.titles.full[0],
  covers: work.manifestations.bestRepresentation.cover,
  materialTypes: getWorkCardMaterialTypes(work.manifestations.all, () => isBlueTitle),
  isBlueTitle,
})

// The card used across sliders and search results: cover on the overlay
// background with material-type icons along the bottom.
const meta = {
  title: "components/WorkCard",
  component: WorkCard,
  parameters: { layout: "centered" },
  args: cardArgs(twoTypes),
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
      <WorkCard {...cardArgs(blueTitle, true)} />
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
