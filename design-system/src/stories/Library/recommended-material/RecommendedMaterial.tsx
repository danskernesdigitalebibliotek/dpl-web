import clsx from "clsx";
import { ButtonFavourite } from "../Buttons/button-favourite/ButtonFavourite";
import Cover from "../cover/Cover";

export type RecommendedMaterialProps = {
  // The secondary line under the title: an author, or e.g. the series-opener
  // label on the series page's related-works cards. Omitted entirely when
  // absent, matching the markup dpl-react emits.
  author?: string;
  description: string;
  src: string;
  alt: string;
  favoriteFill?: boolean;
  materialUrl?: string;
  partOfGrid?: boolean;
};

export const RecommendedMaterial: React.FC<RecommendedMaterialProps> = ({
  author,
  description,
  src,
  alt,
  favoriteFill = true,
  materialUrl,
  partOfGrid = false,
}) => {
  return (
    <div
      className={clsx("recommended-material", {
        "recommended-material--in-grid": partOfGrid,
      })}
    >
      <div className="recommended-material__icon">
        <ButtonFavourite fill={favoriteFill} />
      </div>
      <Cover
        src={src}
        size="large"
        animate={false}
        tint="80"
        shadow="medium"
        coverUrl={materialUrl}
        alt={alt}
      />
      <div className="recommended-material__texts">
        <a href={materialUrl} className="recommended-material__description">
          {description}
        </a>
        {author && (
          <a href={materialUrl} className="recommended-material__author">
            {author}
          </a>
        )}
      </div>
    </div>
  );
};
