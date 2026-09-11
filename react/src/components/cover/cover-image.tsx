import React, { FC } from "react";
import clsx from "clsx";

export type CoverImageProps = {
  src: string;
  altText?: string;
  animate: boolean;
  onImageLoaded: () => void;
  shadow?: "small" | "medium";
};

const CoverImage: FC<CoverImageProps> = ({
  src,
  altText,
  animate,
  onImageLoaded: setImageLoaded,
  shadow
}) => (
  <img
    onLoad={setImageLoaded}
    className={clsx(
      "cover__img",
      {
        "cover__img--animate": animate
      },
      {
        "cover__img--shadow-small": shadow === "small",
        "cover__img--shadow-medium": shadow === "medium"
      }
    )}
    src={src}
    alt={altText || ""}
  />
);

export default CoverImage;
