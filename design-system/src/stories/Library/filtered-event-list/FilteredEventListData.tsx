import { ContentListItemProps } from "../content-list-item/ContentListItem";
import ImageCredited from "../image-credited/ImageCredited";

const FilteredListData: ContentListItemProps[] = [
  {
    image: (
      <ImageCredited src="https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    ),
    tagText: "Foredrag",
    title: "Kunst og kultur i middelalderen",
    description: "En dybdegåendenalysef kunst og kultur i middelalderen.",
    location: "Kulturhuset",
    price: "50 - 100 kr",
    href: "/",
    date: "2023-01-10",
    time: "15:00 - 17:00",
  },
  {
    image: (
      <ImageCredited src="https://plus.unsplash.com/premium_photo-1696886122527-e4303b76aa8f?q=80&w=5156&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    ),
    tagText: "arrangement",
    title: "Fars Legestue",
    description: "Kom forbi til hygge i Fars Legestue",
    location: "Hovedbiblioteket",
    price: "60 KR",
    href: "/",
    date: "2023-01-12",
    time: "18:00 - 20:00",
  },
  {
    tagText: "arrangement",
    title: "Fars Legestue",
    description: "Kom forbi til hygge i Fars Legestue",
    location: "Hovedbiblioteket",
    price: "60 KR",
    href: "/",
    date: "2023-01-13",
    time: "18:00 - 20:00",
    isStacked: true,
  },
  {
    tagText: "arrangement",
    title: "Fars Legestue",
    description: "Kom forbi til hygge i Fars Legestue",
    location: "Hovedbiblioteket",
    price: "60 KR",
    href: "/",
    date: "2023-01-14",
    time: "18:00 - 20:00",
    isStacked: true,
  },
  {
    image: (
      <ImageCredited src="https://images.unsplash.com/photo-1549277513-f1b32fe1f8f5?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    ),
    tagText: "Læsekreds",
    title: "Bogklub for voksne",
    description: "Månedlig bogklub med spændende diskussioner.",
    location: "Hovedbiblioteket",
    price: "Gratis",
    href: "/",
    date: "2023-01-20",
    time: "19:00 - 21:00",
  },
  {
    image: (
      <ImageCredited src="https://plus.unsplash.com/premium_photo-1696886122527-e4303b76aa8f?q=80&w=5156&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    ),
    tagText: "Workshop",
    title: "Kreativ skrivning",
    description: "Workshop i kreativ skrivning for begyndere.",
    location: "Hovedbiblioteket",
    price: "80 KR",
    href: "/",
    date: "2023-01-22",
    time: "13:00 - 16:00",
  },
];

export default FilteredListData;
