import React from "react";
import Link from "../../components/atoms/links/Link";
import { Cover } from "../../components/cover/cover";
import { Pid } from "../../core/utils/types/ids";

type RelatedWorkCardProps = {
  title: string;
  url: URL;
  coverPid: Pid;
  // E.g. "Del 1 i serien Vildheks"; only first-in-series cards carry one.
  seriesLabel?: string;
};

// Bare-bones prototype card: cover and title. No author line - the section
// heading already names the author, so repeating it per card is noise.
const RelatedWorkCard: React.FC<RelatedWorkCardProps> = ({
  title,
  url,
  coverPid,
  seriesLabel
}) => (
  <Link href={url} className="related-works__card">
    <div className="related-works__cover">
      <Cover
        ids={[coverPid]}
        size="medium"
        animate={false}
        alt=""
        shadow="medium"
      />
    </div>
    <p className="related-works__title text-body-small-medium">{title}</p>
    {seriesLabel && (
      <p className="related-works__series-label text-small-caption">
        {seriesLabel}
      </p>
    )}
  </Link>
);

export default RelatedWorkCard;
