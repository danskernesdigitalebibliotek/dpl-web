import { Meta, StoryFn } from "@storybook/react-webpack5";

import Campaign, { CampaignProps } from "./Campaign";

export default {
  title: "Library / Campaign",
  component: Campaign,
  argTypes: {
    title: { control: { type: "text" } },
    url: { control: { type: "text" } },
    imageUrl: { control: { type: "text" } },
  },
  args: {
    title: "10 gode bøger om Venner & Veninder",
    url: "#",
    imageUrl: "https://picsum.photos/id/100/800/800",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/ETOZIfmgGS1HUfio57SOh7/S%C3%B8gning?node-id=4525%3A14602",
    },
  },
} as Meta<typeof Campaign>;

const Template: StoryFn<typeof Campaign> = (args: CampaignProps) => (
  <Campaign {...args} />
);

export const Default = Template.bind({});

export const LongText = Template.bind({});
LongText.args = {
  title:
    "Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati temporibus odit omnis voluptatibus sapiente necessitatibus expedita consequuntur illum nobis eaque aspernatur porro incidunt quod illo vel laudantium nisi, vitae mollitia? Similique vero facere rerum repellendus perferendis commodi placeat illum corporis vel, accusantium fugiat sapiente odio doloribus inventore, aperiam quisquam veniam quia. Provident quo corporis incidunt, facilis laudantium expedita magni dolores?",
};

export const textOnly = Template.bind({});
textOnly.args = {
  imageUrl: "",
};
