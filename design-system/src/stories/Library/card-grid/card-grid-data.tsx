import Card from "../card/Card";
import ImageCredited from "../image-credited/ImageCredited";

const imageUrl = "images/library_shelves.jpg";

const image = <ImageCredited src={imageUrl} />;

export const card = (
  <Card
    title="Bøger som har gjort en forskel for romanens udvikling"
    typeTag="Nyhed"
    dateTag="06 Dec 2022"
    image={image}
  />
);

export const cardNoImage = (
  <Card
    title="Fars legestue, hver onsdag"
    typeTag="Arrangement"
    dateTag="06 Okt - 28 Dec 2022"
    placeholderText="Fri leg for alle aldre"
  />
);
