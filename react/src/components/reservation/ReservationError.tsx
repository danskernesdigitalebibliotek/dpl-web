import FocusTrap from "focus-trap-react";
import React from "react";
import { ReservationResponse, ReservationResult } from "@dpl/fbs";
import { useText } from "../../core/utils/text";
import { Button } from "../Buttons/Button";

type ReservationErrorProps = {
  reservationResults: ReservationResult[];
  setReservationResponse: (
    reservationResponse: ReservationResponse | null
  ) => void;
};

const ReservationError: React.FC<ReservationErrorProps> = ({
  reservationResults,
  setReservationResponse
}) => {
  const t = useText();

  const handleErrorText = (reservationResultArray: ReservationResult[]) => {
    const hasAlreadyReserved = reservationResultArray.some(
      ({ result }) => result === "already_reserved"
    );

    if (hasAlreadyReserved) {
      return {
        title: t("alreadyReservedText"),
        description: "",
        buttonText: t("closeText")
      };
    }
    return {
      title: t("reservationErrorsTitleText"),
      description: t("reservationErrorsDescriptionText"),
      buttonText: t("tryAginButtonText")
    };
  };

  const reservationErrorInfo = handleErrorText(reservationResults);

  return (
    <FocusTrap
      focusTrapOptions={{
        allowOutsideClick: true
      }}
    >
      <section className="reservation-modal reservation-modal--confirm">
        <h2 className="text-header-h3 pb-48">{reservationErrorInfo.title}</h2>
        {reservationErrorInfo.description && (
          <p className="text-body-medium-regular pb-48">
            {reservationErrorInfo.description}
          </p>
        )}
        <Button
          classNames="reservation-modal__confirm-button"
          label={reservationErrorInfo.buttonText}
          buttonType="none"
          disabled={false}
          collapsible={false}
          size="small"
          variant="filled"
          onClick={() => setReservationResponse(null)}
        />
      </section>
    </FocusTrap>
  );
};

export default ReservationError;
