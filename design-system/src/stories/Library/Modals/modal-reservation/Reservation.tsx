import ReservationError from "../../reservation/ReservationError";
import ReservationForm from "../../reservation/ReservationForm";
import ReservationHeader from "../../reservation/ReservationHeader";
import ReservationSucces from "../../reservation/ReservationSucces";
import Modal from "../Modal";

interface ReservationProps {
  title: string;
  label: string;
  author: string;
  submitInfo: string;
  submitButton: string;
  state: "initial" | "success" | "error";
  showPromoBar?: boolean;
  showInstantLoan?: boolean;
  showRecommendations?: boolean;
}

const Reservation = ({
  label,
  title,
  author,
  submitInfo,
  submitButton,
  state,
  showPromoBar,
  showInstantLoan,
  showRecommendations,
}: ReservationProps) => {
  if (state === "success")
    return (
      <Modal shownModal classNames="modal--reservation">
        <ReservationSucces showRecommendations={showRecommendations} />
      </Modal>
    );
  if (state === "error")
    return (
      <Modal shownModal classNames="modal--reservation">
        <ReservationError />;
      </Modal>
    );
  return (
    <Modal shownModal classNames="modal--reservation">
      <section className="reservation-modal">
        <ReservationHeader author={author} label={label} title={title} />
        <ReservationForm
          submitInfo={submitInfo}
          submitButton={submitButton}
          showPromoBar={showPromoBar}
          showInstantLoan={showInstantLoan}
        />
      </section>
    </Modal>
  );
};

export default Reservation;
