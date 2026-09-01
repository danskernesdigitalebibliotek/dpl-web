import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import "./related-works-slider.css";

type RelatedWorksSliderProps = {
  children: React.ReactNode;
};

// A thin wrapper around keen-slider: lays its children out as slides and
// drives the prev/next buttons. It knows nothing about works or series -
// slides arrive as children - so the related-works cards can be redesigned
// without touching it.
const RelatedWorksSlider: React.FC<RelatedWorksSliderProps> = ({
  children
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

  // Fractional perView leaves the last visible slide peeking out at the edge,
  // signalling that the row scrolls - same affordance as bibliotek.dk's
  // series page slider.
  const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: 2.2, spacing: 16 },
    breakpoints: {
      "(min-width: 768px)": { slides: { perView: 3.2, spacing: 16 } },
      "(min-width: 1024px)": { slides: { perView: 5.2, spacing: 24 } }
    },
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
      <div ref={sliderRef} className="keen-slider">
        {React.Children.map(children, (child) => (
          <div className="keen-slider__slide">{child}</div>
        ))}
      </div>
      <div className="related-works-slider__controls">
        {/* Copy is hardcoded for the prototype; becomes *Text props before release. */}
        <button
          type="button"
          className="related-works-slider__button"
          aria-label="Vis forrige"
          disabled={isAtStart}
          onClick={() => instanceRef.current?.prev()}
        >
          ‹
        </button>
        <button
          type="button"
          className="related-works-slider__button"
          aria-label="Vis næste"
          disabled={isAtEnd}
          onClick={() => instanceRef.current?.next()}
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default RelatedWorksSlider;
