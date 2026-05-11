import Cover from "../cover/Cover";
import bookCover3 from "../../../../public/images/placeholder/book_cover_3.jpg";

export type ReservationHeaderProps = {
  author: string;
  label: string;
  title: string;
};

const ReservationHeader = ({
  author,
  label,
  title,
}: ReservationHeaderProps) => {
  return (
    <header className="reservation-modal-header">
      <Cover src={bookCover3} size="medium" animate={false} tint="120" />
      <div className="reservation-modal-description">
        <div className="reservation-modal-tag">{label}</div>
        <h2 className="text-header-h2 mt-22 mb-8">{title}</h2>
        <p className="text-body-medium-regular">{author}</p>
      </div>
    </header>
  );
};

export default ReservationHeader;
