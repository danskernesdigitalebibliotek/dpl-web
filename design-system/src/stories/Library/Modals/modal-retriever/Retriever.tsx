import Modal from "../Modal";
import RetrieverLogo from "../../../../public/icons/logo/retriever_horisontal_blue_logo.png";

export type RetrieverProps = {
  showModal: boolean;
  title: string;
  text: string;
  subHeadline: string;
  byLine: string;
  sourceName: string;
  publishingDate: string;
  footerText: string;
};

export const Retriever = ({
  title,
  text,
  showModal,
  subHeadline,
  byLine,
  sourceName,
  publishingDate,
  footerText,
}: RetrieverProps) => {
  return (
    <Modal shownModal={showModal} classNames="">
      <article className="retriever-article">
        <img className="retriever-logo" src={RetrieverLogo} alt="" />
        <h2 className="retriever-headline">{title}</h2>
        <p className="retriever-subheadline">{subHeadline}</p>
        <p className="retriever-byline">{byLine}</p>

        <div className="retriever-meta">
          <span>{sourceName}</span>
          <span>{publishingDate}</span>
        </div>

        <div
          className="retriever-content"
          dangerouslySetInnerHTML={{ __html: text }}
        />

        <footer className="retriever-footer">
          <p className="retriever-copyright">{footerText}</p>
        </footer>
      </article>
    </Modal>
  );
};
