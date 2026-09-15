import React from "react";
import RetrieverLogo from "@danskernesdigitalebibliotek/dpl-design-system/build/icons/logo/retriever_horisontal_blue_logo.png";
import { useText } from "../../../core/utils/text";
import { formatDate } from "../../../core/utils/helpers/date";

export interface RetrieverModalBodyProps {
  headline: string;
  subHeadline: string;
  sourceName: string;
  byLine: string;
  publishingDate: string;
  textHtml: string;
}

const RetrieverModalBody: React.FunctionComponent<RetrieverModalBodyProps> = ({
  headline,
  subHeadline,
  sourceName,
  byLine,
  publishingDate,
  textHtml
}) => {
  const t = useText();
  return (
    <article className="retriever-article">
      <img className="retriever-logo" src={RetrieverLogo} alt="" />
      <h2 className="retriever-headline">{headline}</h2>
      <p className="retriever-subheadline">{subHeadline}</p>
      <p className="retriever-byline">{`${t("materialHeaderAuthorByText")} ${byLine}`}</p>

      <div className="retriever-meta">
        <span>{`${sourceName}, ${publishingDate ? formatDate(publishingDate) : ""}`}</span>
      </div>

      <div
        className="retriever-content"
        // Only trusted editors from Retriever have access to write Retriever articles
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: textHtml }}
      />

      <footer className="retriever-footer">
        <p className="retriever-copyright">{t("retrieverCopyrightText")}</p>
      </footer>
    </article>
  );
};

export default RetrieverModalBody;
