import { StoryFn, Meta } from "@storybook/react-webpack5";
import MediaContainer from "./MediaContainer";
import ImageCredited from "../image-credited/ImageCredited";

export default {
  title: "Library / Media container",
  component: MediaContainer,
  argTypes: {
    media: { type: "string" },
    placeholderText: { type: "string" },
  },
  args: {
    media: (
      <ImageCredited
        description="Beskrivelse"
        year="2021"
        src="images/bookcase_sofa.jpg"
      />
    ),
    placeholderText: "En placeholder tekst",
  },
} as Meta<typeof MediaContainer>;

const Template: StoryFn<typeof MediaContainer> = (args) => (
  <MediaContainer {...args} />
);

export const Default = Template.bind({});
export const noMedia = Template.bind({});
noMedia.args = {
  media: undefined,
};
