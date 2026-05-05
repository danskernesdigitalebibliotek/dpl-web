import { StoryFn, Meta } from "@storybook/react-webpack5";

import Hero from "./Hero";
import ImageCredited from "../image-credited/ImageCredited";
import eventImg from "../../../../public/images/placeholder/event.jpg";

const defaultArgs = {
  image: (
    <ImageCredited
      src={eventImg}
      description="Photo by Unsplash"
      year="©2021"
    />
  ),
  type: "Type",
  date: "30. december 2025",
  title: "Stine Pilgaard vinder De Gyldne Laurbær",
  description:
    "Boghandlernes store bogpris - De Gyldne går denne gang til Stine Pilgaard for hendes roman 'Meter i sekundet'. Stort tillykke til Stine Pilgaard.",
  items: [
    {
      label: "Tid",
      values: ["19:30 - 21:00"],
    },
    {
      label: "Pris",
      values: ["Børn: Gratis", "Voksne: 65 DKK"],
    },
    {
      label: "Sted",
      values: ["Rentemestervej 76", "2400 København NV"],
    },
    {
      values: ["Café Mors Varme Hænder"],
    },
  ],
  cta: "Køb billet",
  tag: "Arrangement",
  url: "#",
  placeholderText: "Intet billede",
};

export default {
  title: "Library / Hero",
  component: Hero,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/design/IDDOM18MgAWnrrKeaLKxK5/Arrangement?node-id=2625-4323&t=QP3v5mqixzRCs9of-4",
    },
  },
  args: defaultArgs,
  excludeStories: ["EventArgs", "ParagraphArgs", "PageArgs"],
} as Meta<typeof Hero>;

const Template: StoryFn<typeof Hero> = (args) => <Hero {...args} />;

export const Event = Template.bind({});
export const Paragraph = Template.bind({});
export const Page = Template.bind({});

export const EventArgs = {
  ...defaultArgs,
  description: undefined,
  type: undefined,
};

export const ParagraphArgs = {
  ...defaultArgs,
  cta: undefined,
  items: undefined,
  date: undefined,
};

export const PageArgs = {
  ...defaultArgs,
  url: undefined,
  tag: undefined,
  items: undefined,
  date: undefined,
  image: undefined,
};

Event.args = EventArgs;
Paragraph.args = ParagraphArgs;
Page.args = PageArgs;
