import { Meta, StoryFn } from "@storybook/react-webpack5";
import { DigitalLoanCard } from "./DigitalLoanCard";

export default {
  title: "Library / Lists / DigitalLoanCard",
  component: DigitalLoanCard,
  argTypes: {},
} as Meta<typeof DigitalLoanCard>;

const Template: StoryFn<typeof DigitalLoanCard> = (args) => (
  <DigitalLoanCard {...args} />
);

export const Reader = Template.bind({});
Reader.args = {
  cover: {
    materialType: "ebog",
    title: "Caribisk rom",
    author: "Mads Heitmann (2020)",
    image: "images/book_cover_5.jpg",
  },
  counter: {
    isReady: false,
    label: "dage",
    percentage: 25,
    status: "neutral",
    value: 20,
  },
  deadlineNote: "Udløber automatisk 06-06-2026 14:53",
  primaryAction: "reader",
  primaryActionLabel: "Læs ebog",
};

export const Player = Template.bind({});
Player.args = {
  cover: {
    materialType: "lydbog",
    title: "Harry Potter og De Vises Sten",
    author: "Af J.K. Rowling og Jesper Christensen (2025)",
    image: "images/book_cover_3.jpg",
  },
  counter: {
    isReady: false,
    label: "dage",
    percentage: 25,
    status: "neutral",
    value: 20,
  },
  deadlineNote: "Udløber automatisk 06-06-2026 14:55",
  primaryAction: "player",
  primaryActionLabel: "Lyt lydbog",
};
