import clsx from "clsx";
import React from "react";
import Link, { LinkProps } from "../atoms/links/Link";

type StaticRecommendedMaterialProps = {
  title: string;
  linkProps: Pick<LinkProps, "href" | "trackClick">;
  subtitle?: string;
  favoriteButton: React.ReactNode;
  cover: React.ReactNode;
  isPartOfGrid?: boolean;
  isLoading?: boolean;
};

export const StaticRecommendedMaterial = ({
  title,
  subtitle,
  favoriteButton,
  cover,
  isPartOfGrid = false,
  linkProps
}: StaticRecommendedMaterialProps) => {
  const { href, trackClick: trackData } = linkProps ?? {};

  return (
    <div
      className={clsx(
        "recommended-material",
        isPartOfGrid && "recommended-material--in-grid"
      )}
    >
      <div className="recommended-material__icon">{favoriteButton}</div>
      {cover}
      <div className="recommended-material__texts">
        {title && (
          <Link
            href={href}
            className="recommended-material__description"
            dataCy="recommended-description"
            trackClick={trackData}
          >
            {title}
          </Link>
        )}

        {subtitle && (
          <Link
            href={href}
            className="recommended-material__subtitle"
            dataCy="recommended-subtitle"
            trackClick={trackData}
          >
            {subtitle}
          </Link>
        )}
      </div>
    </div>
  );
};

StaticRecommendedMaterial.displayName = "StaticRecommendedMaterial";
