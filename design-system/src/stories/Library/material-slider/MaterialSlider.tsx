import { FC, useEffect, useRef } from "react";
import KeenSlider, { KeenSliderInstance } from "keen-slider";
import "keen-slider/keen-slider.min.css";
import { RecommendedMaterial } from "../recommended-material/RecommendedMaterial";

export type MaterialSliderItem = {
  title: string;
  subtitle?: string;
  href: string;
  coverSrc: string;
};

export type MaterialSliderProps = {
  heading: string;
  items: MaterialSliderItem[];
  // Accessible names of the prev/next controls, which only show an arrow.
  nextLabel: string;
  previousLabel: string;
};

// The Slider block's long-line arrows (Library/slider), with currentColor
// instead of its hardcoded black so they follow the surrounding text color.
const Arrow: FC<{ direction: "left" | "right" }> = ({ direction }) =>
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

// A horizontal slider of material cards with a heading and prev/next
// controls: MaterialGrid's look, in one long line. The track is keen-slider,
// the same library dpl-react drives it with in production; here it only makes
// the story slide, the markup and classes are the contract.
export const MaterialSlider = ({
  heading,
  items,
  nextLabel,
  previousLabel,
}: MaterialSliderProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<KeenSliderInstance | null>(null);

  useEffect(() => {
    if (!trackRef.current) {
      return undefined;
    }

    // Same options as the dpl-react slider: slide width comes from CSS, and
    // the 1px spacing is the shared pixel neighbouring cards' outlines
    // overlap into, like MaterialGrid's 1px grid-gap.
    sliderRef.current = new KeenSlider(trackRef.current, {
      slides: { perView: "auto", spacing: 1 },
    });

    return () => sliderRef.current?.destroy();
  }, []);

  return (
    <div className="material-slider">
      <div className="material-slider__header">
        <h2 className="material-slider__heading text-header-h2">{heading}</h2>
        <div className="material-slider__controls">
          <button
            type="button"
            className="material-slider__button"
            aria-label={nextLabel}
            onClick={() => sliderRef.current?.next()}
          >
            <Arrow direction="right" />
          </button>
          <button
            type="button"
            className="material-slider__button"
            aria-label={previousLabel}
            onClick={() => sliderRef.current?.prev()}
          >
            <Arrow direction="left" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="material-slider__track keen-slider">
        {/* The cards are the same recommended-material markup MaterialGrid items use. */}
        {items.map((item, index) => (
          <div className="keen-slider__slide" key={index}>
            <RecommendedMaterial
              description={item.title}
              subtitle={item.subtitle}
              src={item.coverSrc}
              alt=""
              materialUrl={item.href}
              partOfGrid
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialSlider;
