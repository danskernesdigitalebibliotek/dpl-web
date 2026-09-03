import { FC, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { RecommendedMaterial } from "../../Library/recommended-material/RecommendedMaterial";

export type RelatedWorkItem = {
  title: string;
  href: string;
  coverSrc: string;
  // E.g. "Del 1 i serien Vildheks"; only works that open one of the author's
  // series carry one. Rendered on the card's subtitle line.
  seriesLabel?: string;
};

export type RelatedWorksProps = {
  heading: string;
  items: RelatedWorkItem[];
};

// The Slider block's long-line arrows (Library/slider), with currentColor
// instead of its hardcoded black so they follow the section's text color.
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

// The "Mere af {author}" slider at the bottom of the series page. The track
// is keen-slider; in production dpl-react runs it, so - like Library/slider
// does with swiper - the library is CDN-loaded scaffolding here and only the
// markup and classes are the contract.
export const RelatedWorks = ({ heading, items }: RelatedWorksProps) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<{ prev: () => void; next: () => void } | null>(null);

  useEffect(() => {
    // The CDN script defines window.KeenSlider; poll until it has loaded.
    const poll = setInterval(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const KeenSlider = (window as any).KeenSlider;
      if (!KeenSlider || !trackRef.current) {
        return;
      }

      clearInterval(poll);
      // Same options as the dpl-react slider: slide width comes from CSS,
      // and the 1px spacing is the shared pixel neighbouring cards' outlines
      // overlap into, like MaterialGrid's 1px grid-gap.
      sliderRef.current = new KeenSlider(trackRef.current, {
        slides: { perView: "auto", spacing: 1 },
      });
    }, 100);

    return () => clearInterval(poll);
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore https://github.com/nfl/react-helmet/issues/646 */}
      <Helmet>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/keen-slider@6.8.6/keen-slider.min.css"
        />

        <script src="https://cdn.jsdelivr.net/npm/keen-slider@6.8.6/keen-slider.js" />
      </Helmet>
      <section className="related-works">
        <div className="related-works-slider">
          <div className="related-works-slider__header">
            <h2 className="related-works__heading text-header-h3">{heading}</h2>
            <div className="related-works-slider__controls">
              <button
                type="button"
                className="related-works-slider__button"
                aria-label="Vis forrige"
                onClick={() => sliderRef.current?.prev()}
              >
                <Arrow direction="left" />
              </button>
              <button
                type="button"
                className="related-works-slider__button"
                aria-label="Vis næste"
                onClick={() => sliderRef.current?.next()}
              >
                <Arrow direction="right" />
              </button>
            </div>
          </div>
          <div ref={trackRef} className="keen-slider">
            {/*
              The cards are the same recommended-material markup MaterialGrid
              items use - in dpl-react they are composed from the static
              components with a series-opener label on the subtitle line.
            */}
            {items.map((item, index) => (
              <div className="keen-slider__slide" key={index}>
                <RecommendedMaterial
                  description={item.title}
                  author={item.seriesLabel}
                  src={item.coverSrc}
                  alt=""
                  materialUrl={item.href}
                  partOfGrid
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default RelatedWorks;
