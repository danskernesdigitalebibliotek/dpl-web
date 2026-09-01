import React from "react";
import Link from "../../components/atoms/links/Link";
import { Cover } from "../../components/cover/cover";
import { Pid } from "../../core/utils/types/ids";

type RelatedWorkCardProps = {
  title: string;
  url: URL;
  coverPid: Pid;
  authorLine: string;
};

// Bare-bones prototype card: cover, title, author. What actually goes on the
// card (series label, year, badges) is decided in the design phase.
const RelatedWorkCard: React.FC<RelatedWorkCardProps> = ({
  title,
  url,
  coverPid,
  authorLine
}) => (
  <Link href={url} className="related-works__card">
    <div className="related-works__cover">
      <Cover ids={[coverPid]} size="medium" animate={false} alt="" />
    </div>
    <p className="related-works__title">{title}</p>
    <p className="related-works__author">{authorLine}</p>
  </Link>
);

export default RelatedWorkCard;
