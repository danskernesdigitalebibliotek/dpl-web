import { StoryFn } from "@storybook/react-webpack5";

import Slider from "./Slider";
import Card from "../card/Card";
import CardImages from "../card/CardImages";
import cardOriginal from "../../../../public/images/placeholder/card_original.jpg";
import cardXLarge from "../../../../public/images/placeholder/card_x_large.jpg";
import cardLarge from "../../../../public/images/placeholder/card_large.jpg";
import cardMedium from "../../../../public/images/placeholder/card_medium.jpg";

export default {
  title: "Library / Slider",
  component: Slider,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=7711-76621",
    },
  },
  argTypes: {
    title: { type: "string" },
    items: { control: false },
  },
  args: {
    title: "Get <u>new</u> Inspiration",
  },
};

const Template: StoryFn<typeof Slider> = (args) => <Slider {...args} />;

const image = (
  <CardImages
    src={cardOriginal}
    alternativeSrcs={[
      { name: "x-large", src: cardXLarge },
      { name: "large", src: cardLarge },
      { name: "medium", src: cardMedium },
    ]}
  />
);

const card = (
  <Card
    title="Bøger som har gjort en forskel for romanens udvikling"
    typeTag="Nyhed"
    dateTag="06 Dec 2022"
    image={image}
  />
);

const cardNoImage = (
  <Card
    title="Fars legestue, hver onsdag"
    typeTag="Arrangement"
    dateTag="06 Okt - 28 Dec 2022"
    placeholderText="Fri leg for alle aldre"
  />
);

export const Many = Template.bind({});
Many.args = {
  items: [
    card,
    cardNoImage,
    card,
    cardNoImage,
    cardNoImage,
    card,
    cardNoImage,
    card,
    card,
    cardNoImage,
    card,
    cardNoImage,
    card,
    card,
  ],
};
