import { StoryFn, Meta } from "@storybook/react-webpack5";

import NavSpots from "./NavSpots";
import NavSpot from "../nav-spot/NavSpot";
import ImageCredited from "../image-credited/ImageCredited";
import bookshelfImg from "../../../../public/images/placeholder/bookshelf.jpg";

const media = (
  <ImageCredited src={bookshelfImg} />
);
const teaser = (
  <NavSpot
    title="Digital læselyst"
    subtitle="Find inspiration, tips og værktøjer til hvordan dit barn kommer videre med læsningen."
    media={media}
  />
);

const teaserNoImage = (
  <NavSpot
    title="Digital læselyst"
    subtitle="Find inspiration, tips og værktøjer til hvordan dit barn kommer videre med læsningen."
    placeholderText="Mangler billede"
  />
);

export default {
  title: "Library / Nav spots (Navigationsmodul)",
  component: NavSpots,
  argTypes: {
    items: {
      control: false,
    },
  },
  args: {
    items: [teaser, teaser],
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=1958-7664&mode=design&t=nK04fkaFk3f9pafj-4",
    },
  },
} as Meta<typeof NavSpots>;

const Template: StoryFn<typeof NavSpots> = (args) => <NavSpots {...args} />;

const Many = Template.bind({});

Many.args = {
  items: [teaser, teaser],
};

const ManyNoImage = Template.bind({});

ManyNoImage.args = {
  items: [teaserNoImage, teaserNoImage],
};

const Single = Template.bind({});

Single.args = {
  items: [teaser],
};

const SingleNoImage = Template.bind({});

SingleNoImage.args = {
  items: [teaserNoImage],
};

export { Many, ManyNoImage, Single, SingleNoImage };
