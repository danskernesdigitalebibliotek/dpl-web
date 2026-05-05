import Cover from "../cover/Cover";
import bookCover3 from "../../../../public/images/placeholder/book_cover_3.jpg";
import { ReactComponent as ExpandMoreIcon } from "../../../public/icons/collection/ExpandMore.svg";

type InstantLoanSummaryProps = {
  title: string;
  subTitle: string;
  underlineDescription: string;
};

const InstantLoanSummary: React.FunctionComponent<InstantLoanSummaryProps> = ({
  title,
  subTitle,
  underlineDescription,
}) => (
  <>
    <div className="pagefold-triangle--small" />
    <Cover
      src={bookCover3}
      size="small"
      animate={false}
      tint="120"
    />
    <div>
      <h2 className="text-header-h4 mt-22 mb-4">{title}</h2>
      <p className="text-small-caption">{subTitle}</p>
      <div className="instant-loan-underline mt-35">
        <p className="link-tag text-small-caption">{underlineDescription}</p>
        <ExpandMoreIcon className="instant-loan-arrow" />
      </div>
    </div>
  </>
);

export default InstantLoanSummary;
