import React, { useEffect, useState } from "react";
import { useKeenSlider } from "keen-slider/react";
import type { KeenSliderInstance } from "keen-slider/react";
// keen-slider's own functional stylesheet (track/slide layout). The visual
// styling of the section lives in the design system
// (Blocks/series-page/related-works.scss).
import "keen-slider/keen-slider.min.css";

// The design system Slider block's long-line arrows (Library/slider), with
// currentColor instead of its hardcoded black so they follow the section's
// text color.
const Arrow: React.FC<{ direction: "left" | "right" }> = ({ direction }) =>
  direction === "right" ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="115"
      height="26"
      viewBox="0 0 115 26"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M114.707 13.2464C115.098 12.8559 115.098 12.2228 114.707 11.8322L108.343 5.46827C107.953 5.07774 107.319 5.07774 106.929 5.46827C106.538 5.85879 106.538 6.49196 106.929 6.88248L112.586 12.5393L106.929 18.1962C106.538 18.5867 106.538 19.2199 106.929 19.6104C107.319 20.0009 107.953 20.0009 108.343 19.6104L114.707 13.2464ZM0 13.5393H114V11.5393H0V13.5393Z" />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="115"
      height="25"
      viewBox="0 0 115 25"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0.292893 12.0906C-0.0976333 12.4811 -0.0976334 13.1143 0.292892 13.5048L6.65685 19.8688C7.04738 20.2593 7.68054 20.2593 8.07107 19.8688C8.46159 19.4783 8.46159 18.8451 8.07107 18.4546L2.41422 12.7977L8.07107 7.14087C8.46159 6.75034 8.46159 6.11718 8.07107 5.72665C7.68054 5.33613 7.04738 5.33613 6.65685 5.72665L0.292893 12.0906ZM115 11.7977L1 11.7977L1 13.7977L115 13.7977L115 11.7977Z" />
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
            aria-label="Vis næste"
            disabled={isAtEnd}
            onClick={() => instanceRef.current?.next()}
          >
            <Arrow direction="right" />
          </button>
          <button
            type="button"
            className="related-works-slider__button"
            aria-label="Vis forrige"
            disabled={isAtStart}
            onClick={() => instanceRef.current?.prev()}
          >
            <Arrow direction="left" />
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
