import {
  MaterialSlider,
  MaterialSliderItem,
} from "../../Library/material-slider/MaterialSlider";

export type RelatedWorksProps = {
  heading: string;
  items: MaterialSliderItem[];
};

// The "Mere af {author}" section at the bottom of the series page: a
// MaterialSlider of the author's other works. Works that open one of the
// author's other series carry the series label ("Del 1 i Vildheks") as their
// subtitle.
export const RelatedWorks = ({ heading, items }: RelatedWorksProps) => (
  <section className="related-works">
    <MaterialSlider
      heading={heading}
      items={items}
      nextLabel="Vis næste"
      previousLabel="Vis forrige"
    />
  </section>
);

export default RelatedWorks;
