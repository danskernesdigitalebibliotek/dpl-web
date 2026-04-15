import * as React from "react";
import { FC } from "react";
import { CampaignMatchPOST200Data } from "../../core/dpl-cms/model";
import { useUrlStatistics } from "../../core/statistics/useStatistics";
import Arrow from "../atoms/icons/arrow/arrow";

export interface CampaignProps {
  campaignData: CampaignMatchPOST200Data;
}

const Campaign: FC<CampaignProps> = ({ campaignData }) => {
  const { redirectWithUrlTracking } = useUrlStatistics();
  if (!campaignData.title) {
    return null;
  }

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!campaignData.url) {
      return;
    }

    event.preventDefault();

    redirectWithUrlTracking({
      campaignUrl: campaignData.url,
      parameterValue: campaignData.title as string
    });
  };

  return (
    <a
      className="campaign arrow arrow__hover--right-small"
      href={campaignData.url}
      data-cy="campaign-body"
      onClick={onClick}
    >
      {campaignData?.image?.url && (
        <img
          className="campaign__image"
          src={campaignData.image.url}
          alt={campaignData?.image?.alt}
        />
      )}
      {campaignData.text && (
        <h2 className="campaign__title">{campaignData.text}</h2>
      )}
      <Arrow />
    </a>
  );
};

export default Campaign;
