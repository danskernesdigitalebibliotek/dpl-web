import { StoryFn, Meta } from "@storybook/react-webpack5";
import Collapsible from "./Collapsible";

export default {
  title: "Library / Collapsible",
  component: Collapsible,
  argTypes: {
    isOpen: { control: "boolean" },
  },
  args: {
    isOpen: true,
    children: (
      <p className="text-body-medium-regular">
        Toggle isOpen to animate this content open and closed. While closed, the
        content stays in the markup but is inert.
      </p>
    ),
  },
} as Meta<typeof Collapsible>;

const Template: StoryFn<typeof Collapsible> = (args) => (
  <Collapsible {...args} />
);

export const Default = Template.bind({});
export const Closed = Template.bind({});
Closed.args = {
  isOpen: false,
};
