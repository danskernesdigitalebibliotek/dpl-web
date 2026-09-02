import { FC, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import Cover from "../../Library/cover/Cover";

export type RelatedWorkItem = {
  title: string;
  href: string;
  coverSrc: string;
  // E.g. "Del 1 i serien Vildheks"; only works that open one of the author's
  // series carry one.
  seriesLabel?: string;
};

export type RelatedWorksProps = {
  heading: string;
  items: RelatedWorkItem[];
};

// One card's chevron-arrow control. Drawn inline: the icon set has no plain
// chevron of this weight, and the stroke inherits the button's text color.
const Chevron: FC<{ direction: "left" | "right" }> = ({ direction }) => (
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
      // Same options as the dpl-react slider: slide width comes from CSS.
      sliderRef.current = new KeenSlider(trackRef.current, {
        slides: { perView: "auto", spacing: 12 },
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
            <h2 className="related-works__heading text-header-h4">{heading}</h2>
            <div className="related-works-slider__controls">
              <button
                type="button"
                className="related-works-slider__button"
                aria-label="Vis forrige"
                onClick={() => sliderRef.current?.prev()}
              >
                <Chevron direction="left" />
              </button>
              <button
                type="button"
                className="related-works-slider__button"
                aria-label="Vis næste"
                onClick={() => sliderRef.current?.next()}
              >
                <Chevron direction="right" />
              </button>
            </div>
          </div>
          <div ref={trackRef} className="keen-slider">
            {items.map((item, index) => (
              <div className="keen-slider__slide" key={index}>
                <a href={item.href} className="related-works__card">
                  <div className="related-works__cover">
                    <Cover
                      src={item.coverSrc}
                      size="medium"
                      animate={false}
                      shadow="medium"
                    />
                  </div>
                  <p className="related-works__title text-body-small-medium">
                    {item.title}
                  </p>
                  {item.seriesLabel && (
                    <p className="related-works__series-label text-small-caption">
                      {item.seriesLabel}
                    </p>
                  )}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default RelatedWorks;
