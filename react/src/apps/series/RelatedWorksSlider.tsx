import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider/react";
// keen-slider's own functional stylesheet (track/slide layout). The visual
// styling of the section lives in the design system
// (Blocks/series-page/related-works.scss).
import "keen-slider/keen-slider.min.css";

// The design system's icon set has no plain chevron of this weight, so the
// arrow is drawn inline; it inherits the button's text color via stroke.
const Chevron: React.FC<{ direction: "left" | "right" }> = ({ direction }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
  >
    <path
      d="M6 3l5 5-5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type RelatedWorksSliderProps = {
  children: React.ReactNode;
  // Rendered on the header row, with the prev/next controls right-aligned
  // beside it.
  heading: React.ReactNode;
};

// A thin wrapper around keen-slider: lays its children out as slides and
// drives the prev/next buttons. It knows nothing about works or series -
// slides arrive as children - so the related-works cards can be redesigned
// without touching it.
const RelatedWorksSlider: React.FC<RelatedWorksSliderProps> = ({
  children,
  heading
}) => {
  // Both start true so the buttons are disabled until keen-slider reports a
  // real position - and stay that way when every slide fits in the viewport,
  // where there is nothing to scroll to.
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(true);

  const updateEdges = (slider: KeenSliderInstance) => {
    const details = slider.track?.details;

    // details is null while the slider has no measurable size (e.g. rendered
    // inside a hidden container).
    if (!details) {
      return;
    }

    setIsAtStart(details.rel === 0);
    setIsAtEnd(details.rel === details.maxIdx);
  };

  // perView "auto" sizes slides from their CSS width (set on
  // .keen-slider__slide in the stylesheet), so cards keep a fixed max width
  // and constant spacing on every screen size - wide screens simply show
  // more of them.
  // 1px spacing, not 0: like MaterialGrid's 1px grid-gap, it gives the
  // neighbouring cards' outlines one shared pixel to overlap into, so cards
  // sit edge-to-edge separated by a single line instead of a doubled one.
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: "auto", spacing: 1 },
    created: updateEdges,
    slideChanged: updateEdges,
    updated: updateEdges
  });

  const slideCount = React.Children.count(children);

  // keen-slider only remeasures on window resize by itself; a changed number
  // of slides needs a manual update or the track keeps stale bounds.
  useEffect(() => {
    instanceRef.current?.update();
  }, [slideCount, instanceRef]);

  return (
    <div className="related-works-slider">
      <div className="related-works-slider__header">
        {heading}
        <div className="related-works-slider__controls">
          {/* Copy is hardcoded for the prototype; becomes *Text props before release. */}
          <button
            type="button"
            className="related-works-slider__button"
            aria-label="Vis forrige"
            disabled={isAtStart}
            onClick={() => instanceRef.current?.prev()}
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className="related-works-slider__button"
            aria-label="Vis næste"
            disabled={isAtEnd}
            onClick={() => instanceRef.current?.next()}
          >
            <Chevron direction="right" />
          </button>
        </div>
      </div>
      <div ref={sliderRef} className="keen-slider">
        {React.Children.map(children, (child) => (
          <div className="keen-slider__slide">{child}</div>
        ))}
      </div>
    </div>
  );
};

export default RelatedWorksSlider;
