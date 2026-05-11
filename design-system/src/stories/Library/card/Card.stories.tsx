import { StoryFn, Meta } from "@storybook/react-webpack5";

import Card from "./Card";
import CardImages from "./CardImages";
import cardOriginal from "../../../../public/images/placeholder/card_original.jpg";
import cardXLarge from "../../../../public/images/placeholder/card_x_large.jpg";
import cardLarge from "../../../../public/images/placeholder/card_large.jpg";
import cardMedium from "../../../../public/images/placeholder/card_medium.jpg";

export default {
  title: "Library / Card ('news card')",
  component: Card,
  args: {
    typeTag: "Arrangement",
    dateTag: "06 Dec 2022",
    title: "Bøger som har gjort en forskel for romanens udvikling",
    href: "https://google.com",
    image: (
      <CardImages
        src={cardOriginal}
        alternativeSrcs={[
          { name: "x-large", src: cardXLarge },
          { name: "large", src: cardLarge },
          { name: "medium", src: cardMedium },
        ]}
      />
    ),
    placeholderText: "Stine Pilgaard vinder De Gyldne Laurbær",
  },
  argTypes: {
    variant: {
      control: false,
    },
    typeTag: {
      type: "string",
    },
    dateTag: {
      type: "string",
    },
    title: {
      type: "string",
    },
    href: {
      type: "string",
    },
    placeholderText: {
      type: "string",
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=1968-8159&mode=design&t=8uX61DMzCXLhbNod-4",
    },
  },
} as Meta<typeof Card>;

const Template: StoryFn<typeof Card> = (args) => <Card {...args} />;

const XLarge = Template.bind({});

XLarge.args = {
  variant: "x-large",
};

const XLargeNoImage = Template.bind({});
XLargeNoImage.args = {
  variant: "x-large",
  image: undefined,
};

const Large = Template.bind({});
Large.args = {
  variant: "large",
};

const LargeNoImage = Template.bind({});
LargeNoImage.args = {
  variant: "large",
  image: undefined,
};

const Medium = Template.bind({});
Medium.args = {
  variant: "medium",
};

const MediumNoImage = Template.bind({});
MediumNoImage.args = {
  variant: "medium",
  image: undefined,
};

const Small = Template.bind({});
Small.args = {
  variant: "small",
};

const SmallNoImage = Template.bind({});
SmallNoImage.args = {
  variant: "small",
  image: undefined,
};

export {
  XLarge,
  XLargeNoImage,
  Large,
  LargeNoImage,
  Medium,
  MediumNoImage,
  Small,
  SmallNoImage,
};
