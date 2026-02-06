import type { Meta, StoryObj } from "@storybook/nextjs"

import { darkModeDecorator } from "@/.storybook/decorators"
import TextBody from "@/components/paragraphs/TextBody/TextBody"

const meta = {
  title: "components/TextBody",
  component: TextBody,
  parameters: {
    layout: "centered",
  },
  args: {
    body: {
      processed:
        '<h2>Børnejuryen har talt, og de nominerede til Orlaprisen 2023 er fundet!</h2><p>Der er nomineret i alt 15 bøger fordelt på 5 kategorier. Se alle de nominerede til Orlaprisen 2023 herunder.</p><p>Du kan stemme her på orlaprisen.dk fra d. 5. oktober til den 5. november. Vinderne af Orlaprisen 2023 offentliggøres d. 23. november.</p><p>&nbsp;</p><h3>Fantasy - Bogen der sendte mig til andre verdener</h3><ol><li>Troldmanden i træet af John Kenn Mortensen</li><li>De glemte vogtere af Andreas Boeskov</li><li>Gro af Adam O.</li></ol><h3>Fantasy - Bogen der sendte mig til andre verdener</h3><ul><li>Troldmanden i træet af John Kenn Mortensen</li><li>De glemte vogtere af Andreas Boeskov</li><li>Gro af Adam O.</li></ul><p>Thomas Brunstrøm (f. 1977) <strong>er journa</strong>list, filmanm<em>elder og børnebogsforfa</em>tter. Han har sammen med Thorbjørn Christoffersen skabt den populære børnebogsserie Sallys far, bøgerne om Sallys lillebror Eddie, o<u>g billedbogsserien </u>om Anton og farmor, som er en hyldest til fantasien –<a href="/node/27" target="_blank" data-entity-type="node" data-entity-uuid="5b67227c-adfb-46bd-8808-afc5494b24f9" data-entity-substitution="canonical"> og ikke mindst bedsteforæld</a>re.</p><p>Serien om Sallys far var Makkerparrets gode ide at skrive en bog om pigen Sally, hvis far er ekstraordinær legesyg og barnlig – ofte skæg, men af og til mest pinlig. Serien tæller adskillelige bøger og er blevet en populær oplæsningsserie blandt danske børn.</p><p>&nbsp;</p>',
    },
  },
} satisfies Meta<typeof TextBody>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: args => <TextBody {...args} />,
}

export const DarkMode: Story = {
  decorators: [darkModeDecorator],
  render: args => <TextBody {...args} />,
}
