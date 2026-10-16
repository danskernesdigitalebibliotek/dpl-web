import { Meta, StoryFn } from "@storybook/react-webpack5";
import ActionList from "./ActionList";

export default {
  title: "Library / Lists / Action list",
  component: ActionList,
  argTypes: {
    items: { control: "object" },
  },
  args: {
    items: [
      {
        title: "Chrome/macOS",
        caption: "Sidst brugt 15-10-2026",
        buttonLabel: "Fjern",
      },
      {
        title: "Safari/iOS",
        caption: "Sidst brugt 15-10-2026",
        buttonLabel: "Fjern",
      },
      {
        title: "Chrome/Windows",
        caption: "Sidst brugt 07-10-2026",
        buttonLabel: "Fjern",
      },
    ],
  },
  parameters: {
    layout: "fullscreen",
  },
} as Meta<typeof ActionList>;

const Template: StoryFn<typeof ActionList> = (props) => (
  <ActionList {...props} />
);

export const ActionListExample = Template.bind({});
