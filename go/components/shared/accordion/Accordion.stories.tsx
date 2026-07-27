import type { Meta, StoryObj } from "@storybook/nextjs"
import React from "react"

import { darkModeDecorator } from "@/.storybook/decorators"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./Accordion"

const sections = [
  {
    value: "delivery",
    title: "Levering og afhentning",
    body: "Du henter dit lånte materiale på dit lokale bibliotek. Du får besked, så snart det er klar — typisk inden for nogle få hverdage.",
  },
  {
    value: "loan-period",
    title: "Lånetid og fornyelse",
    body: "Standardlånetiden er 30 dage. De fleste materialer kan fornys op til to gange, hvis ingen står på venteliste.",
  },
  {
    value: "fees",
    title: "Gebyrer ved for sen aflevering",
    body: "Ved for sen aflevering pålægges et gebyr. Beløbet afhænger af materialet og hvor lang tid det er forsinket.",
  },
  {
    value: "digital",
    title: "Digitale materialer",
    body: "E-bøger, lydbøger og podcasts kan lånes direkte hjemmefra med dit bibliotekslogin eller UNI·Login.",
  },
]

const Demo = ({ type }: { type: "single" | "multiple" }) => (
  <div className="bg-background w-[480px] max-w-[90vw] p-6">
    {type === "single" ? (
      <Accordion type="single" collapsible defaultValue={sections[0].value}>
        {sections.map(section => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    ) : (
      <Accordion type="multiple" defaultValue={[sections[0].value, sections[1].value]}>
        {sections.map(section => (
          <AccordionItem key={section.value} value={section.value}>
            <AccordionTrigger>{section.title}</AccordionTrigger>
            <AccordionContent>{section.body}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )}
  </div>
)

const meta = {
  title: "components/Accordion",
  component: Demo,
  parameters: {
    layout: "centered",
  },
  args: {
    type: "single",
  },
  argTypes: {
    type: {
      control: { type: "radio" },
      options: ["single", "multiple"],
    },
  },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Single: Story = {
  args: { type: "single" },
}

export const Multiple: Story = {
  args: { type: "multiple" },
}

export const DarkMode: Story = {
  args: { type: "single" },
  decorators: [darkModeDecorator],
}
