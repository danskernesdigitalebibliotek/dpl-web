import { StoryFn, Meta } from "@storybook/react-webpack5";

import Medias from "./Medias";
import ImageCredited from "../image-credited/ImageCredited";
import media1Img from "../../../../public/images/placeholder/media-1.jpeg";
import media2Img from "../../../../public/images/placeholder/media-2.jpeg";

export default {
  title: "Library / Medias",
  component: Medias,
  argTypes: {
    items: {
      // Disabling controls, as the different variations are added already.
      control: false,
    },
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=7477-39100&mode=design&t=SREzD6mFi3A15ap4-4",
    },
  },
} as Meta<typeof Medias>;

const Template: StoryFn<typeof Medias> = (args) => <Medias {...args} />;

export const Multiple = Template.bind({});
Multiple.args = {
  items: [
    <ImageCredited
      key={0}
      src={media1Img}
      description="Happy dog is Happy"
    />,
    <ImageCredited key={1} src={media2Img} />,
  ],
};

export const Single = Template.bind({});
Single.args = {
  items: [<ImageCredited key={0} src={media2Img} />],
};
