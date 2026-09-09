import React, { useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import ArrowLong from "../atoms/icons/arrow/arrow-long";
import ButtonFavourite, {
  ButtonFavouriteId
} from "../button-favourite/button-favourite";
import { StaticCover } from "../cover/static-cover";
import { StaticRecommendedMaterial } from "../recommended-material/static-recommended-material";
import { useText } from "../../core/utils/text";

export type MaterialSliderItem = {
  id: ButtonFavouriteId;
  title: string;
  subtitle?: string;
  url: URL;
  coverSrc: string | null;
};

/**
 * Where the track is, as far as the controls are concerned. "uninitialized"
 * until keen-slider has reported a position; "shows-all" when every slide fits
 * in the viewport, so there is nothing to scroll to either way.
 */
type SliderState =
  "uninitialized" | "shows-all" | "at-start" | "at-end" | "in-between";

/**
 * Derives the slider state from a keen-slider instance.
 *
 * @param slider - The instance keen-slider passes to its event hooks.
 * @returns The state its controls should reflect.
 */
const getSliderState = (slider: KeenSliderInstance): SliderState => {
  const details = slider.track?.details;

  // details is null while the slider has no measurable size (e.g. rendered
  // inside a hidden container).
  if (!details) {
    return "uninitialized";
  }

  const totalSlideWidth = slider.slides.reduce(
    (totalWidth, slide) => totalWidth + slide.clientWidth,
    0
  );

  // The width check comes before the index checks on purpose: a single slide
  // wider than the viewport is at the start and at the end at once without
  // showing everything, and must keep its next button.
  if (slider.size > totalSlideWidth) {
    return "shows-all";
  }

  if (details.rel === 0) {
    return "at-start";
  }

  if (details.rel === details.maxIdx) {
    return "at-end";
  }

  return "in-between";
};

type MaterialSliderProps = {
  heading: string;
  items: MaterialSliderItem[];
  /** Called with the item's id when its favourite button is clicked. */
  onFavorite: (id: ButtonFavouriteId) => void;
};

/**
 * A horizontal slider of material cards with a heading and prev/next
 * controls: MaterialGrid's look, in one long line.
 */
const MaterialSlider: React.FC<MaterialSliderProps> = ({
  heading,
  items,
  onFavorite
}) => {
  const t = useText();
  const [sliderState, setSliderState] = useState<SliderState>("uninitialized");

  const update = (slider: KeenSliderInstance) => {
    setSliderState(getSliderState(slider));
  };

  const canScroll =
    sliderState !== "uninitialized" && sliderState !== "shows-all";
  const canScrollForward = canScroll && sliderState !== "at-end";
  const canScrollBack = canScroll && sliderState !== "at-start";

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: "auto", spacing: 1 },
    created: update,
    slideChanged: update,
    updated: update
  });

  return (
    <div className="material-slider">
      <div className="material-slider__header">
        <h2 className="material-slider__heading text-header-h2">{heading}</h2>
        <div className="material-slider__controls">
          <button
            type="button"
            className="material-slider__button"
            aria-label={t("materialSliderNextText")}
            disabled={!canScrollForward}
            onClick={() => instanceRef.current?.next()}
          >
            <ArrowLong direction="right" />
          </button>
          <button
            type="button"
            className="material-slider__button"
            aria-label={t("materialSliderPreviousText")}
            disabled={!canScrollBack}
            onClick={() => instanceRef.current?.prev()}
          >
            <ArrowLong direction="left" />
          </button>
        </div>
      </div>
      <div
        ref={sliderRef}
        className="material-slider__track keen-slider"
        // Slides that do not fill the track are centered in it.
        style={{
          justifyContent: sliderState === "shows-all" ? "center" : undefined
        }}
      >
        {items.map((item) => (
          <div className="keen-slider__slide" key={item.id}>
            <StaticRecommendedMaterial
              title={item.title}
              subtitle={item.subtitle}
              isPartOfGrid
              linkProps={{ href: item.url }}
              cover={
                <StaticCover
                  src={item.coverSrc ?? undefined}
                  displaySize="large"
                  shadow="medium"
                  alt=""
                  linkProps={{ url: item.url }}
                />
              }
              favoriteButton={
                <ButtonFavourite
                  title={item.title}
                  id={item.id}
                  addToListRequest={onFavorite}
                />
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

MaterialSlider.displayName = "MaterialSlider";

export default MaterialSlider;
