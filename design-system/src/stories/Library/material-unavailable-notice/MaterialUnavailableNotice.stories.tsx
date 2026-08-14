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
  },
  args: {
    title: "The material is not available through the website",
    description:
      "Visit the library and get help from a librarian or check whether the material is available at",
    linkText: "Bibliotek.dk",
    linkUrl: "https://bibliotek.dk",
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
