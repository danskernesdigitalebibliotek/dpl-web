import { StoryFn, Meta } from "@storybook/react-webpack5";
import ImageCredited from "./ImageCredited";

export default {
  title: "Library / Image Credited",
  component: ImageCredited,
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    description: { control: "text" },
    year: { control: "text" },
  },
  args: {
    src: "images/event_audience.jpg",
    alt: "Photo by Unsplash",
    description: "Fernisering Modern Dans",
    year: "©2021",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=7477-39846&mode=dev",
    },
  },
} as Meta<typeof ImageCredited>;

const Template: StoryFn<typeof ImageCredited> = (args) => (
  <ImageCredited {...args} />
);

export const Default = Template.bind({});
export const withOutImage = Template.bind({});
withOutImage.args = {
  src: "",
};
