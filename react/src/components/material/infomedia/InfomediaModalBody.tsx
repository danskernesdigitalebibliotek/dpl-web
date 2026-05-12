import React from "react";
import RetrieverLogo from "@danskernesdigitalebibliotek/dpl-design-system/build/icons/logo/retriever_horisontal_blue_logo.png";
import { useText } from "../../../core/utils/text";

export interface InfomediaModalBodyProps {
  headLine: string;
  hedLine: string;
  paper: string;
  byLine: string;
  dateLine: string;
  text: string;
}

const InfomediaModalBody: React.FunctionComponent<InfomediaModalBodyProps> = ({
  headLine,
  hedLine,
  paper,
  byLine,
  dateLine,
  text
}) => {
  const t = useText();
  return (
    <article className="infomedia-article">
      <img className="infomedia-logo" src={RetrieverLogo} alt="" />
      <h2 className="infomedia-headline">{headLine}</h2>
      <p className="infomedia-hedline">{hedLine}</p>
      <p className="infomedia-byline">{`${t("materialHeaderAuthorByText")} ${byLine}`}</p>

      <div className="infomedia-meta">
        <span>{`${paper}, ${dateLine}`}</span>
      </div>

      <div
        className="infomedia-content"
        // Only trusted editors from infomedia have access to write infomedia articles
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: text }}
      />

      <footer className="infomedia-footer">
        <p className="infomedia-copyright">{t("infomediaCopyrightText")}</p>
      </footer>
    </article>
  );
};

export default InfomediaModalBody;
