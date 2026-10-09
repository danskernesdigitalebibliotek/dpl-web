import { Meta, StoryFn } from "@storybook/react-webpack5";
import { StatusLoans as StatusLoansComp } from "./statusLoans";

export default {
  title: "Blocks / User Profile / Status loans",
  component: StatusLoansComp,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/xouARmJCONbzbZhpD8XpcM/Brugerprofil?node-id=1239%3A66855",
    },
  },
  argTypes: {
    title: { control: "text" },
    statusBars: { control: "object" },
    link: { control: "object" },
    reservationsText: { control: "text" },
  },
  args: {
    title: "Digitale lån",
    statusBars: [
      { amount: 3, fullAmount: 7, title: "E-bøger", outOf: "ud af" },
      { amount: 3, fullAmount: 7, title: "Lydbøger", outOf: "ud af" },
    ],
    link: {
      text: "Se titler som ikke tæller med i din kvote.",
      link: "https://www.figma.com/file/xouARmJCONbzbZhpD8XpcM/Brugerprofil?node-id=1239%3A66855",
    },
    reservationsText: "Du kan reservere 3 e-bøger og 3 lydbøger",
  },
} as Meta<typeof StatusLoansComp>;

const Template: StoryFn<typeof StatusLoansComp> = (args) => (
  <StatusLoansComp {...args} />
);

export const StatusLoans = Template.bind({});
