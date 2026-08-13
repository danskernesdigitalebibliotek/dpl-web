import { StoryFn, Meta } from "@storybook/react-webpack5";

import DateRangeFacet from "./DateRangeFacet";

export default {
  title: "Library / Date Range Facet",
  component: DateRangeFacet,
  argTypes: {
    locale: {
      control: "select",
      options: ["en", "da"],
    },
  },
  args: {
    locale: "en",
    placeholder: "All dates",
  },
  parameters: {
    layout: "padded",
  },
} as Meta<typeof DateRangeFacet>;

const Template: StoryFn<typeof DateRangeFacet> = (args) => (
  <DateRangeFacet {...args} />
);

export const Default = Template.bind({});

export const WithPreselectedRange = Template.bind({});
WithPreselectedRange.args = {
  defaultDate: ["2024-01-01", "2024-01-10"],
};
