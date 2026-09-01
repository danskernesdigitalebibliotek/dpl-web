import type { Meta, StoryObj } from "@storybook/nextjs"
import React, { useEffect } from "react"

import { darkModeDecorator } from "@/.storybook/decorators"
import { Button } from "@/components/shared/button/Button"
import { Toaster, toast } from "@/components/shared/toaster/Toaster"

// Fires all four variants on mount (non-dismissing) so every style is
// visible at once for review and visual regression.
const AllVariants = ({ withIcon = false }: { withIcon?: boolean }) => {
  useEffect(() => {
    const options = { duration: Infinity, withIcon }
    toast.info("Neutral information. Ikke så kritisk.", options)
    toast.error("Advarsel. Der er noget helt galt!", options)
    toast.warning("Her er en gul advarsel", options)
    toast.success("Her er en grøn information om at noget er gået godt", options)
    return () => {
      toast.dismiss()
    }
  }, [withIcon])
  return <Toaster expand />
}

const Playground = () => (
  <>
    <div className="flex min-h-64 flex-wrap items-start gap-4 p-10">
      <Button size="sm" onClick={() => toast.info("Neutral information. Ikke så kritisk.")}>
        Info
      </Button>
      <Button size="sm" onClick={() => toast.error("Advarsel. Der er noget helt galt!")}>
        Error
      </Button>
      <Button size="sm" onClick={() => toast.warning("Her er en gul advarsel")}>
        Warning
      </Button>
      <Button
        size="sm"
        onClick={() =>
          toast.success("Her er en grøn information om at noget er gået godt", { withIcon: true })
        }>
        Success (med ikon)
      </Button>
    </div>
    <Toaster />
  </>
)

const meta = {
  title: "components/Toaster",
  component: Toaster,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <AllVariants />,
}

export const DefaultDarkMode: Story = {
  render: () => <AllVariants />,
  decorators: [darkModeDecorator],
}

// Icons are opt-in per toast via `withIcon` and use the variant's icon.
export const WithIcons: Story = {
  render: () => <AllVariants withIcon />,
}

export const Trigger: Story = {
  render: () => <Playground />,
}
