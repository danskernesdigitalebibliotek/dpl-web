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
  material: {
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
  material: {
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

const readerExpiringSoonBase = {
  material: {
    materialType: "ebog",
    title: "Caribisk rom",
    author: "Mads Heitmann (2020)",
    image: "images/book_cover_5.jpg",
  },
  deadlineNote: "Udløber automatisk 28-05-2026 12:12",
  primaryAction: "reader" as const,
  primaryActionLabel: "Læs ebog",
};

export const ReaderWithWarning = Template.bind({});
ReaderWithWarning.args = {
  ...readerExpiringSoonBase,
  material: {
    ...readerExpiringSoonBase.material,
    title: "Bertram 2 - Rent guld i posen",
    author: "Bjarne Reuter (2013)",
  },
  counter: {
    isReady: false,
    label: "dage",
    percentage: 80,
    status: "warning",
    value: 3,
  },
  statusBadge: { label: "Under 6 dage", status: "warning" },
};

export const ReaderOverdue = Template.bind({});
ReaderOverdue.args = {
  ...readerExpiringSoonBase,
  counter: {
    isReady: false,
    label: "dage",
    percentage: 100,
    status: "danger",
    value: 0,
  },
  statusBadge: { label: "Udløber i dag", status: "danger" },
};

export const ReaderWithPeriodical = Template.bind({});
ReaderWithPeriodical.args = {
  ...Reader.args,
  material: {
    materialType: "ebog",
    title: "Weekendavisen",
    author: "Weekendavisen (2026)",
    image: "images/book_cover_5.jpg",
  },
  periodical: "Nr. 21, 2026",
};

export const ReaderWithSeries = Template.bind({});
ReaderWithSeries.args = {
  ...Reader.args,
  material: {
    materialType: "ebog",
    title: "Bertram 2 - Rent guld i posen",
    author: "Bjarne Reuter (2013)",
    image: "images/book_cover_5.jpg",
  },
  series: "Bertram-bøgerne (2)",
};
