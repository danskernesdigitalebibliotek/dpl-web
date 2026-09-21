import clsx from "clsx";
import { ButtonFavourite } from "../Buttons/button-favourite/ButtonFavourite";
import Cover from "../cover/Cover";

export type RecommendedMaterialProps = {
  subtitle?: string;
  description: string;
  src: string;
  alt: string;
  favoriteFill?: boolean;
  materialUrl?: string;
  partOfGrid?: boolean;
};

export const RecommendedMaterial: React.FC<RecommendedMaterialProps> = ({
  subtitle,
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
        {subtitle && (
          <a href={materialUrl} className="recommended-material__subtitle">
            {subtitle}
          </a>
        )}
      </div>
    </div>
  );
};
