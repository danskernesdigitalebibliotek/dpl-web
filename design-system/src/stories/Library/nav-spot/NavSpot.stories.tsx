import { StoryFn, Meta } from "@storybook/react-webpack5";

import NavSpot from "./NavSpot";
import ImageCredited from "../image-credited/ImageCredited";
import bookshelfImg from "../../../../public/images/placeholder/bookshelf.jpg";

export default {
  title: "Library / Nav-spot (Navigationsmodul)",
  component: NavSpot,
  argTypes: {
    variant: {
      control: false,
    },
    title: {
      control: "text",
      type: "string",
    },
    subtitle: {
      control: "text",
      type: "string",
    },
    media: {
      control: "object",
      type: "string",
    },
  },
  args: {
    title: "Bøger som har gjort en forskel for romanens udvikling",
    subtitle: "Stine Pilgaard vinder De Gyldne Laurbær",
    media: (
      <ImageCredited src={bookshelfImg} />
    ),
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=1958-7664&mode=design&t=nK04fkaFk3f9pafj-4",
    },
  },
} as Meta<typeof NavSpot>;

const Template: StoryFn<typeof NavSpot> = (args) => <NavSpot {...args} />;

const Large = Template.bind({});
Large.args = {
  variant: "large",
};

const Medium = Template.bind({});
Medium.args = {
  variant: "medium",
};

const Small = Template.bind({});
Small.args = {
  variant: "small",
};

export { Large, Medium, Small };
