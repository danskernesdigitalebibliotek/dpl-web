import { Meta, StoryFn } from "@storybook/react-webpack5";

import {
  MaterialUnavailableNotice,
  MaterialUnavailableNoticeProps,
} from "./MaterialUnavailableNotice";

export default {
  title: "Library / Material unavailable notice",
  component: MaterialUnavailableNotice,
  argTypes: {
    title: {
      name: "Title",
      control: { type: "text" },
    },
    description: {
      name: "Description",
      control: { type: "text" },
    },
    linkText: {
      name: "Link text",
      control: { type: "text" },
    },
    linkUrl: {
      name: "Link url",
      control: { type: "text" },
    },
    variant: {
      name: "Variant",
      control: { type: "radio" },
      options: ["regular", "compact"],
    },
  },
  args: {
    title: "The material is not available through the website",
    description:
      "Visit the library and get help from a librarian or check whether the material is available at",
    linkText: "Bibliotek.dk",
    linkUrl: "https://bibliotek.dk",
    variant: "regular",
  },
  parameters: {
    layout: "padded",
  },
} as Meta<typeof MaterialUnavailableNotice>;

const Template: StoryFn<typeof MaterialUnavailableNotice> = (
  args: MaterialUnavailableNoticeProps,
) => <MaterialUnavailableNotice {...args} />;

export const Default = Template.bind({});

export const WithoutLink = Template.bind({});
WithoutLink.args = {
  linkText: undefined,
  linkUrl: undefined,
};

// Used where the notice replaces a small button, e.g. in the manifestation
// list. It drops the title and the link and only keeps a short description.
export const Compact = Template.bind({});
Compact.args = {
  variant: "compact",
  description: "Kontakt bibliotek for adgang",
};
