import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import Images from "@/components/paragraphs/Images/Images"
import { MediaImage } from "@/lib/graphql/generated/dpl-cms/graphql"

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
// images in the staggered side-by-side layout.
const meta = {
  title: "components/Images",
  component: Images,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Images>

export default meta
type Story = StoryObj<typeof meta>

export const SingleImage: Story = {
  args: {
    goImages: [buildImage(1200, 800, "Foto: Ukendt fotograf")],
  },
}

export const TwoImages: Story = {
  args: {
    goImages: [
      buildImage(800, 1000, "Foto: Ukendt fotograf"),
      buildImage(800, 600, "Foto: Også ukendt"),
    ],
  },
}

export const TwoImagesDarkMode: Story = {
  decorators: [darkModeDecorator],
  args: {
    goImages: [
      buildImage(800, 1000, "Foto: Ukendt fotograf"),
      buildImage(800, 600, "Foto: Også ukendt"),
    ],
  },
}
