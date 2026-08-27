import type { Meta, StoryObj } from "@storybook/react";
import { StaticCover } from "./StaticCover";
import { getCurrentLocation } from "../../core/utils/helpers/url";
import { coverImageUrls } from "./helper";

const meta: Meta<typeof StaticCover> = {
  title: "Components / Static Cover",
  component: StaticCover,
  argTypes: {
    size: {
      name: "Image size",
      control: { type: "radio" }
    },
    tint: {
      name: "Background color tint",
      control: { type: "radio" }
    },
    animate: {
      name: "Use animation",
      control: { type: "boolean" }
    },
    src: {
      name: "Image source",
      control: { type: "text" }
    },
    alt: {
      name: "Alt text",
      control: { type: "text" }
    }
  },
  args: {
    size: "large",
    animate: true,
    tint: "120",
    src: coverImageUrls.large,
    alt: "alt text for the image"
  }
};

export default meta;

type Story = StoryObj<typeof StaticCover>;

export const Default: Story = {};

export const AsLink: Story = {
  args: {
    url: new URL("/", getCurrentLocation())
  }
};

export const WithoutImage: Story = {
  args: {
    src: null
  }
};
