import { Meta, StoryFn } from "@storybook/react-webpack5";
import SeriesPage, { SeriesPageProps } from "./SeriesPage";
import SeriesPageSkeleton from "./SeriesPageSkeleton";
import { SeriesCardProps } from "../../Library/series-card/SeriesCard";

const members: SeriesCardProps[] = [
  {
    title: "Harry Potter og De Vises Sten",
    href: "/",
    author: "J.K. Rowling",
    year: "1998",
    numberInSeries: "Nr. 1 i serien",
    readThisFirstLabel: "Begynd med denne",
    description:
      "Harry har boet hos sin ubehagelige tante og onkel i elleve år, da et brev fra Hogwarts Skole for Heksekunster og Troldmandskab vender hans liv på hovedet. På skolen finder han sine første venner, sine første fjender og de første spor efter sandheden om forældrenes død.",
    availabilityLabels: 2,
  },
  {
    title: "Harry Potter og Hemmelighedernes Kammer",
    href: "/",
    author: "J.K. Rowling",
    year: "1999",
    numberInSeries: "Nr. 2 i serien",
    description:
      "Andet år på Hogwarts. En gammel forbandelse er brudt løs på skolen, og elever bliver forstenede en efter en. Harry hører en stemme, ingen andre kan høre.",
    availabilityLabels: 4,
  },
  // No description - about a third of members have none.
  {
    title: "Harry Potter og Fangen fra Azkaban",
    href: "/",
    author: "J.K. Rowling",
    year: "2000",
    numberInSeries: "Nr. 3 i serien",
    availabilityLabels: 1,
  },
  // No part number - these still belong in the listing.
  {
    title: "Quidditch gennem tiderne",
    href: "/",
    author: "J.K. Rowling",
    year: "2001",
    description:
      "Opslagsværk om quidditch, spillets historie og de mest berømte hold.",
    availabilityLabels: 3,
  },
];

export default {
  title: "Blocks / Series Page",
  component: SeriesPage,
  argTypes: {
    title: { control: { type: "text" } },
    description: { control: { type: "text" } },
    seriesByText: { control: { type: "text" } },
    author: { control: { type: "text" } },
    authorHref: { control: { type: "text" } },
  },
  args: {
    title: "Harry Potter",
    description:
      "Den verdenskendte fantasyserie om den forældreløse Harry, der kommer på en magisk skole for at lære trolddom. Bøgerne følger ham gennem syv år, hvor han får nye venner og lærer mere om den magiske verden og om sine forældre. Men truslen fra den onde Lord Voldemort hænger hele tiden over Harry, der må igen og igen sætte alt ind for at stoppe ham.",
    seriesByText: "Serie af",
    author: "J.K. Rowling",
    authorHref: "/",
    coverSrcs: [
      "images/book_cover_1.jpg",
      "images/book_cover_2.jpg",
      "images/book_cover_3.jpg",
    ],
    members,
    // More members than the four listed, so the pager keeps its "show more"
    // button - the state a visitor lands on for any series worth paging.
    totalMembers: 12,
  },
} as Meta<typeof SeriesPage>;

const Template: StoryFn<typeof SeriesPage> = (args: SeriesPageProps) => (
  <SeriesPage {...args} />
);

export const Default = Template.bind({});
Default.args = {};

// Around a third of series have no description at all, so the page must not
// leave a gap where it would have been.
export const WithoutDescription = Template.bind({});
WithoutDescription.args = {
  description: undefined,
};

export const SkeletonVersion: StoryFn<typeof SeriesPageSkeleton> = () => (
  <SeriesPageSkeleton />
);

// Not every series has an author to name - anthologies and mixed series do not.
export const WithoutAuthor = Template.bind({});
WithoutAuthor.args = {
  author: undefined,
};

// With no covers the description keeps its own readable width rather than
// stretching across the whole container.
export const WithoutCovers = Template.bind({});
WithoutCovers.args = {
  coverSrcs: [],
};
