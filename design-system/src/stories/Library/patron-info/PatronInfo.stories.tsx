import { Meta, StoryFn } from "@storybook/react-webpack5";

import PatronInfo from "./PatronInfo";
import PatronInfoSkeleton from "./PatronInfoSkeleton";

export default {
  title: "Library / User info",
  component: PatronInfo,
  argTypes: {
    nameLabel: { control: "text" },
    name: { control: "text" },
  },
  args: {
    nameLabel: "Navn",
    name: "Professor Utonium",
  },
  parameters: {},
} as Meta<typeof PatronInfo>;

const Template: StoryFn<typeof PatronInfo> = (props) => (
  <PatronInfo {...props} />
);

export const PatronInfoExample = Template.bind({});

const SkeletonTemplate: StoryFn<typeof PatronInfoSkeleton> = () => (
  <PatronInfoSkeleton />
);

export const PatronInfoSkeletonExample = SkeletonTemplate.bind({});
