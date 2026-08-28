import { Meta, StoryFn } from "@storybook/react-webpack5";
import SeriesCard, { SeriesCardProps } from "./SeriesCard";
import { SeriesCardSkeleton } from "./SeriesCardSkeleton";

export default {
  title: "Library / Series Card",
  component: SeriesCard,
  argTypes: {
    title: { control: { type: "text" } },
    href: { control: { type: "text" } },
    author: { control: { type: "text" } },
    year: { control: { type: "text" } },
    numberInSeries: { control: { type: "text" } },
    readThisFirstLabel: { control: { type: "text" } },
    description: { control: { type: "text" } },
    heartFill: { control: { type: "boolean" } },
    tintIndex: { control: { type: "number" } },
  },
  args: {
    title: "Harry Potter og De Vises Sten",
    href: "/",
    author: "J.K. Rowling",
    year: "1998",
    numberInSeries: "Nr. 1 i serien",
    readThisFirstLabel: undefined,
    description:
      "Harry har boet hos sin ubehagelige tante og onkel i elleve år, da et brev fra Hogwarts Skole for Heksekunster og Troldmandskab vender hans liv på hovedet. På skolen finder han sine første venner, sine første fjender og de første spor efter sandheden om forældrenes død.",
    heartFill: false,
    tintIndex: 0,
  },
} as Meta<typeof SeriesCard>;

const Template: StoryFn<typeof SeriesCard> = (args: SeriesCardProps) => (
  <SeriesCard {...args} />
);

export const Default = Template.bind({});
Default.args = {};

export const ReadThisFirst = Template.bind({});
ReadThisFirst.args = {
  readThisFirstLabel: "Begynd med denne",
};

// Around a third of series members have no description.
export const WithoutDescription = Template.bind({});
WithoutDescription.args = {
  description: undefined,
};

// Members with no part number still appear in the listing.
export const WithoutNumberInSeries = Template.bind({});
WithoutNumberInSeries.args = {
  numberInSeries: undefined,
};

export const Bare = Template.bind({});
Bare.args = {
  numberInSeries: undefined,
  description: undefined,
};

// A short description must not leave a gap where the clamp would be.
export const ShortDescription = Template.bind({});
ShortDescription.args = {
  readThisFirstLabel: "Begynd med denne",
  description: "Første bind i serien.",
};

// The title wraps to two lines at the width in the design.
export const LongTitle = Template.bind({});
LongTitle.args = {
  title: "Harry Potter og Fønixordenen: den komplette og uforkortede udgave",
};

export const SkeletonItem: StoryFn<typeof SeriesCardSkeleton> = () => {
  return <SeriesCardSkeleton />;
};
