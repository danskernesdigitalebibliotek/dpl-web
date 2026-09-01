import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { ShowcaseItem } from "@/.storybook/showcase"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
import { coverFactory } from "@/cypress/factories/fbi/factory-parts/cover"

// Real covers come in varying proportions; the box takes the cover's own
// aspect ratio, so the material-type icon always straddles the image edge.
const buildCover = (width: number, height: number) => {
  const url = `https://placehold.co/${width}x${height}.jpg`
  return coverFactory.build({
    thumbnail: url,
    xSmall: { url, width, height },
    small: { url, width, height },
    medium: { url, width, height },
    large: { url, width, height },
  })
}

const covers = {
  tall: buildCover(420, 720),
  standard: buildCover(500, 720),
  square: buildCover(660, 720),
}

const meta = {
  title: "components/ManifestationCover",
  component: ManifestationCover,
  parameters: { layout: "centered" },
  args: {
    cover: covers.standard,
    iconName: "book",
  },
} satisfies Meta<typeof ManifestationCover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => (
    <div className="w-40 p-10">
      <ManifestationCover {...args} />
    </div>
  ),
}

// The icon-edge behaviour across the ratios covers actually come in.
export const AspectRatios: Story = {
  render: args => (
    <div className="flex items-end gap-10 p-10">
      {(Object.keys(covers) as Array<keyof typeof covers>).map(ratio => (
        <ShowcaseItem key={ratio} title={ratio}>
          <div className="w-40">
            <ManifestationCover {...args} cover={covers[ratio]} />
          </div>
        </ShowcaseItem>
      ))}
    </div>
  ),
}

// Cost-free digital materials get the "GRATIS" tag on the icon.
export const CostFree: Story = {
  args: { iconName: "ebook", costFree: true },
  render: args => (
    <div className="w-40 p-10">
      <ManifestationCover {...args} />
    </div>
  ),
}

export const DefaultDarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => (
    <div className="w-40 p-10">
      <ManifestationCover {...args} />
    </div>
  ),
}
