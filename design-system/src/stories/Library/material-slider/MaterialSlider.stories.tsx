import { Meta, StoryFn } from "@storybook/react-webpack5";
import MaterialGridData from "../material-grid/MaterialGridData";
import { MaterialSlider, MaterialSliderItem } from "./MaterialSlider";

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
      description: "Heading above the track",
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
