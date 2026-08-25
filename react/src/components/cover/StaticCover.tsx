import clsx from "clsx";
import React, { useCallback, useState } from "react";
import LinkNoStyle from "../atoms/links/LinkNoStyle";
import CoverImage from "./cover-image";
import { FbiCoverImageSizeKey, DisplaySize } from "./cover.types";
import { getCoverDisplaySize } from "./helper";

export type StaticCoverProps = {
  animate: boolean;
  size: FbiCoverImageSizeKey;
  displaySize?: DisplaySize;
  tint?: "20" | "40" | "80" | "100" | "120";
  src?: string | null;
  alt?: string;
  url?: URL;
  shadow?: "small" | "medium";
  linkAriaLabelledBy?: string;
  trackClick?: () => Promise<unknown>;
};

// Presentational counterpart to Cover: renders an already-resolved cover
// image URL instead of fetching one. Use it when the surrounding component
// has fetched the cover as part of its own query.
export const StaticCover = ({
  url,
  alt,
  size,
  displaySize,
  animate,
  tint,
  src,
  shadow,
  linkAriaLabelledBy,
  trackClick
}: StaticCoverProps) => {
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const handleSetImageLoaded = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const coverDisplaySize = getCoverDisplaySize({ displaySize, size });

  type TintClassesType = {
    [key: string]: string;
  };

  const tintClasses: TintClassesType = {
    default: "bg-identity-tint-120",
    "120": "bg-identity-tint-120",
    "100": "bg-identity-tint-100",
    "80": "bg-identity-tint-80",
    "40": "bg-identity-tint-40",
    "20": "bg-identity-tint-20"
  };

  const classes = {
    wrapper: clsx(
      "cover",
      `cover--size-${coverDisplaySize}`,
      `cover--aspect-${coverDisplaySize}`,
      imageLoaded || tintClasses[tint || "default"]
    )
  };

  if (url) {
    return (
      <LinkNoStyle
        className={classes.wrapper}
        url={url}
        ariaLabelledBy={linkAriaLabelledBy}
        isHiddenFromScreenReaders={!alt}
        trackClick={trackClick}
      >
        {src && (
          <CoverImage
            setImageLoaded={handleSetImageLoaded}
            src={src}
            altText={alt}
            animate={animate}
            shadow={shadow}
          />
        )}
      </LinkNoStyle>
    );
  }

  return (
    <div className={classes.wrapper}>
      {src && (
        <CoverImage
          setImageLoaded={handleSetImageLoaded}
          src={src}
          altText={alt}
          animate={animate}
          shadow={shadow}
        />
      )}
    </div>
  );
};
