import { ContentListItemProps } from "../content-list-item/ContentListItem";
import ImageCredited from "../image-credited/ImageCredited";
import concertImg from "../../../../public/images/placeholder/concert.jpg";
import galleryImg from "../../../../public/images/placeholder/gallery.jpg";

const FilteredListData: ContentListItemProps[] = [
  {
    image: (
      <ImageCredited src={concertImg} />
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
      <ImageCredited src={galleryImg} />
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
    image: (
      <ImageCredited src={concertImg} />
    ),
    tagText: "arrangement",
    title: "Fars Legestue",
    description: "Kom forbi til hygge i Fars Legestue",
    location: "Hovedeblibloteket",
    price: "60 KR",
    href: "/",
    date: "2023-01-13",
    time: "18:00 - 20:00",
  },
  {
    image: (
      <ImageCredited src={galleryImg} />
    ),
    tagText: "arrangement",
    title: "Fars Legestue",
    description: "Kom forbi til hygge i Fars Legestue",
    location: "Hovedeblibloteket",
    price: "60 KR",
    href: "/",
    date: "2023-01-14",
    time: "18:00 - 20:00",
  },
];

export default FilteredListData;
