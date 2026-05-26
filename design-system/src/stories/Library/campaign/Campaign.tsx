import React from "react";
import { ReactComponent as ArrowSmallRight } from "../Arrows/icon-arrow-ui/icon-arrow-ui-small-right.svg";

export type CampaignProps = {
  title?: string;
  url: string;
  imageUrl?: string;
};

const Campaign: React.FunctionComponent<CampaignProps> = ({
  title,
  url,
  imageUrl,
}) => {
  return (
    <a className="campaign arrow arrow__hover--right-small" href={url}>
      {imageUrl && (
        <div className="campaign__image">
          <img src={imageUrl} alt="" />
        </div>
      )}
      {title && <h2 className="campaign__title">{title}</h2>}
      <ArrowSmallRight />
    </a>
  );
};

export default Campaign;
