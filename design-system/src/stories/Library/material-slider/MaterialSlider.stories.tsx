import { Meta, StoryFn } from "@storybook/react-webpack5";
import MaterialGridData from "../material-grid/MaterialGridData";
import {
  MaterialSlider,
  MaterialSliderCaption,
  MaterialSliderItem,
  MaterialSliderTitle,
} from "./MaterialSlider";

const items: MaterialSliderItem[] = MaterialGridData.map((material) => ({
  title: material.description,
  subtitle: material.subtitle,
  href: material.materialUrl ?? "#",
  coverSrc: material.src,
}));

export default {
  title: "Library/ Material Slider",
  component: MaterialSlider,
  argTypes: {
    heading: {
      control: "text",
      description:
        "Heading above the track. A string becomes the title; a node can compose a caption and a title.",
    },
    items: {
      control: "object",
      description: "The materials to show, one card each",
    },
    nextLabel: {
      control: "text",
      description: "Accessible name of the next button",
    },
    previousLabel: {
      control: "text",
      description: "Accessible name of the previous button",
    },
  },
  args: {
    heading: "More by the author",
    items,
    nextLabel: "Show next",
    previousLabel: "Show previous",
  },
} as Meta<typeof MaterialSlider>;

const Template: StoryFn<typeof MaterialSlider> = (args) => (
  <MaterialSlider {...args} />
);

export const Default = Template.bind({});

// A caption names where the slider's material came from, above its title.
// The title is long on purpose: the heading wraps clear of the controls.
export const WithCaption = Template.bind({});
WithCaption.args = {
  heading: (
    <>
      <MaterialSliderCaption>Because you borrowed</MaterialSliderCaption>
      <MaterialSliderTitle>
        Legender fra VM : alt om superstjernerne
      </MaterialSliderTitle>
    </>
  ),
};

// A heading long enough to wrap: the lines stay clear of the controls on the
// right instead of running underneath them.
export const LongHeading = Template.bind({});
LongHeading.args = {
  heading:
    "Verdens største fodboldklubber og alt om de bedste hold i hele verden gennem tiderne",
};
