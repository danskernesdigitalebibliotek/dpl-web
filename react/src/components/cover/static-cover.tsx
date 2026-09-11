import React from "react";
import LinkNoStyle, { LinkNoStyleProps } from "../atoms/links/LinkNoStyle";
import CoverImage, { CoverImageProps } from "./cover-image";
import clsx from "clsx";
import { DisplaySize } from "./cover.types";

type StaticCoverProps = {
  src?: string;
  displaySize: DisplaySize;
  animate?: boolean;
  tint?: Tint;
  alt?: string;
  shadow?: CoverImageProps["shadow"];
  onImageLoaded?: CoverImageProps["onImageLoaded"];
  hasImageLoaded?: boolean;
  linkProps?: {
    url?: LinkNoStyleProps["url"];
    ariaLabelledBy?: LinkNoStyleProps["ariaLabelledBy"];
    trackClick?: LinkNoStyleProps["trackClick"];
  };
};

export const StaticCover = ({
  linkProps,
  displaySize,
  src,
  alt,
  onImageLoaded = noop,
  hasImageLoaded = true,
  shadow,
  animate = false,
  tint = "default"
}: StaticCoverProps) => {
  const { url, ariaLabelledBy, trackClick } = linkProps ?? {};

  const classes = {
    wrapper: clsx(
      "cover",
      `cover--size-${displaySize}`,
      `cover--aspect-${displaySize}`,
      hasImageLoaded || tintClassNames[tint]
    )
  };

  if (url) {
    return (
      <LinkNoStyle
        className={classes.wrapper}
        url={url}
        ariaLabelledBy={ariaLabelledBy}
        isHiddenFromScreenReaders={!alt}
        trackClick={trackClick}
      >
        {src && (
          <CoverImage
            onImageLoaded={onImageLoaded}
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
          onImageLoaded={onImageLoaded}
          src={src}
          altText={alt}
          animate={animate}
          shadow={shadow}
        />
      )}
    </div>
  );
};

type Tint = "20" | "40" | "80" | "100" | "120" | "default";

type TintClassNames = {
  [key in Tint]: string;
};

const tintClassNames: TintClassNames = {
  default: "bg-identity-tint-120",
  "20": "bg-identity-tint-20",
  "40": "bg-identity-tint-40",
  "80": "bg-identity-tint-80",
  "100": "bg-identity-tint-100",
  "120": "bg-identity-tint-120"
};

const noop = () => {};

StaticCover.displayName = "StaticCover";
