import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import Images from "@/components/paragraphs/Images/Images"
import { MediaImage } from "@/lib/graphql/generated/dpl-cms/graphql"

const withContentContainer = (Story: React.ComponentType): React.ReactElement => (
  <div className="content-container py-10">
    <Story />
  </div>
)

const buildImage = (width: number, height: number, byline: string) =>
  ({
    byline,
    mediaImage: {
      url: `https://placehold.co/${width}x${height}.jpg`,
      alt: "Placeholder",
      width,
      height,
    },
  }) as unknown as MediaImage

// The images paragraph from the CMS: a single image renders full width, two
// images in the staggered side-by-side layout. The blur-up placeholder is
// mocked in Storybook (the real one is an async server component).
// The component only reads goImages; the remaining ParagraphGoImages fields
// (id, created, langcode, status) are CMS bookkeeping the story can skip.
const imagesArgs = (goImages: MediaImage[]) =>
  ({ goImages }) as unknown as React.ComponentProps<typeof Images>

const meta = {
  title: "paragraphs/Images",
  component: Images,
  parameters: { layout: "fullscreen" },
  decorators: [withContentContainer],
} satisfies Meta<typeof Images>

export default meta
type Story = StoryObj<typeof meta>

export const SingleImage: Story = {
  args: imagesArgs([buildImage(1200, 800, "Foto: Ukendt fotograf")]),
}

// The staggered two-image layout across aspect ratio combinations.
export const TwoImagesMixed: Story = {
  args: imagesArgs([
    buildImage(800, 1000, "Foto: Ukendt fotograf"),
    buildImage(800, 600, "Foto: Også ukendt"),
  ]),
}

export const TwoImagesPortrait: Story = {
  args: imagesArgs([
    buildImage(800, 1200, "Foto: Ukendt fotograf"),
    buildImage(800, 1000, "Foto: Også ukendt"),
  ]),
}

export const TwoImagesLandscape: Story = {
  args: imagesArgs([
    buildImage(1200, 800, "Foto: Ukendt fotograf"),
    buildImage(1200, 675, "Foto: Også ukendt"),
  ]),
}

export const TwoImagesSquare: Story = {
  args: imagesArgs([
    buildImage(800, 800, "Foto: Ukendt fotograf"),
    buildImage(800, 800, "Foto: Også ukendt"),
  ]),
}

export const TwoImagesMixedDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: imagesArgs([
    buildImage(800, 1000, "Foto: Ukendt fotograf"),
    buildImage(800, 600, "Foto: Også ukendt"),
  ]),
}
