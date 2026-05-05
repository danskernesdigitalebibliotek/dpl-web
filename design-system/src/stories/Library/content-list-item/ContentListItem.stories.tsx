import { StoryFn, Meta } from "@storybook/react-webpack5";
import { ContentListItem } from "./ContentListItem";
import ImageCredited from "../image-credited/ImageCredited";
import bookshelfImg from "../../../../public/images/placeholder/bookshelf.jpg";
import honeyImg from "../../../../public/images/placeholder/honey.jpg";
import readingRoomImg from "../../../../public/images/placeholder/reading-room.jpg";

export default {
  title: "Library / Content List Item",
  component: ContentListItem,
  argTypes: {
    tagText: { control: { type: "text" } },
    title: { control: { type: "text" } },
    description: { control: { type: "text" } },
    date: { control: { type: "text" } },
    time: { control: { type: "text" } },
    location: { control: { type: "text" } },
    price: { control: { type: "text" } },
    href: { control: { type: "text" } },
    image: { control: { type: "object" } },
    placeholderText: { control: { type: "text" } },
  },
  args: {
    tagText: "Foredrag",
    title: "Ny indsamling til Læs for livet",
    description:
      "Demokrati betyder helt enkelt folkestyre og er en måde at fordele magten i fx et land",
    date: "25 Feb 2023",
    time: "19:30 - 21:00",
    location: "Stadsbiblioteket",
    price: "80 KR",
    href: "/",
    image: <ImageCredited src={bookshelfImg} />,
    placeholderText: "Stine Pilgaard vinder De Gyldne Laurbær",
  },
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zx9GrkFA3l4ISvyZD2q0Qi/Designsystem?type=design&node-id=7690-56463&mode=design&t=RCEb5jOu9CS9Ui9x-4",
    },
    layout: "full",
  },
} as Meta<typeof ContentListItem>;

export const TemplateEvent: StoryFn<typeof ContentListItem> = (args) => (
  <ContentListItem {...args} />
);

const TemplateArticle: StoryFn<typeof ContentListItem> = () => (
  <ContentListItem
    {...{
      href: "#",
      tagText: "True Crime",
      title: "Peter Plys og honning-kuppet",
      publicationDate: "15 Maj 2025",
      description:
        "Da honningen tog overhånd - en historie om Peter Plys og hans fald ind i afhængighedens mørke væsen.",
      image: <ImageCredited src={honeyImg} />,
    }}
  />
);

const TemplateBranch: StoryFn<typeof ContentListItem> = () => (
  <ContentListItem
    {...{
      href: "#",
      title: "Hovedbiblioteket",
      description: "Krystalgade 15, 1172 København K, Danmark",
      image: <ImageCredited src={readingRoomImg} />,
    }}
  />
);

export const Event = TemplateEvent.bind({});
export const Article = TemplateArticle.bind({});
export const Branch = TemplateBranch.bind({});
