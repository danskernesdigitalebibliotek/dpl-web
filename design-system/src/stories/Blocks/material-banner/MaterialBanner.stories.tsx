import { Meta, StoryFn } from "@storybook/react-webpack5";

import { MaterialBanner } from "./MaterialBanner";
import bookCover1 from "../../../../public/images/placeholder/book_cover_1.jpg";
import bookCover2 from "../../../../public/images/placeholder/book_cover_2.jpg";
import bookCover3 from "../../../../public/images/placeholder/book_cover_3.jpg";
import bookCover4 from "../../../../public/images/placeholder/book_cover_4.jpg";
import bookCover5 from "../../../../public/images/placeholder/book_cover_5.jpg";
import bookCover6 from "../../../../public/images/placeholder/book_cover_6.jpg";
import bookCover7 from "../../../../public/images/placeholder/book_cover_7.jpg";

export default {
  title: "Blocks / Material Banner",
  component: MaterialBanner,
  argTypes: {
    title: { control: "text" },
    body: { control: "text" },
    covers: { control: "object" },
    linkFilters: { control: "object" },
    button: { control: "object" },
    showLinkfilters: { control: "boolean" },
  },
  args: {
    title: "Nyt på hylderne",
    body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    covers: [
      {
        title: "De uadskillelige",
        description: "Simone de Beauvoir",
        isLiked: false,
        cover: {
          src: bookCover1,
          animate: true,
          size: "medium",
          tint: "80",
        },
      },
      {
        title: "Den lille bog om dansk design",
        description: "Af Marie Hugsted",
        isLiked: false,
        cover: {
          src: bookCover7,
          animate: true,
          size: "medium",
          tint: "40",
        },
      },
      {
        title: "Audrey Hepburn",
        description: "Isabel Sánchez Vegara",
        isLiked: true,
        cover: {
          src: bookCover3,
          animate: true,
          size: "medium",
          tint: "100",
        },
      },
      {
        title: "Døgnkioskmennesket",
        description: "Sayaka Murata",
        isLiked: false,
        cover: {
          src: bookCover4,
          animate: true,
          size: "medium",
          tint: "120",
        },
      },
      {
        title: "Experiment with photosynthesis",
        description: "Søren Rasmussen",
        isLiked: false,
        cover: {
          src: bookCover5,
          animate: true,
          size: "medium",
          tint: "20",
        },
      },
      {
        title: "Sauna",
        description: "Af Anton M. Berg",
        isLiked: false,
        cover: {
          src: bookCover6,
          animate: true,
          size: "medium",
          tint: "80",
        },
      },
      {
        title: "De uadskillelige",
        description: "Simone de Beauvoir",
        isLiked: false,
        cover: {
          src: bookCover1,
          animate: true,
          size: "medium",
          tint: "40",
        },
      },
      {
        title: "Den lille bog om dansk design",
        description: "Af Marie Hugsted",
        isLiked: false,
        cover: {
          src: bookCover2,
          animate: true,
          size: "medium",
          tint: "100",
        },
      },
    ],
    linkFilters: [
      {
        title: "Bob Dylan 80 år",
        href: "/",
        counter: "8",
      },
      {
        title: "Familien Bridgerton",
        href: "/",
        counter: "24",
      },
      {
        title: "Bøger til din ferie",
        href: "/",
        counter: "48",
      },
      {
        title: "Læs dig gennem Danmark",
        href: "/",
        counter: "16",
      },
    ],
    button: undefined,
    showLinkfilters: true,
  },
} as Meta<typeof MaterialBanner>;

const Template: StoryFn<typeof MaterialBanner> = (args) => (
  <MaterialBanner {...args} />
);

export const Item = Template.bind({});
