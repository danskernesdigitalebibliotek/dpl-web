import React, { FC } from "react";
import { useText } from "../../../../core/utils/text";
import { MaterialProps } from "../../../loan-list/materials/utils/material-fetch-hoc";
import { ReservationType } from "../../../../core/utils/types/reservation-type";
import LinkButton from "../../../../components/Buttons/LinkButton";
import { Button } from "../../../../components/Buttons/Button";

export interface ReservationDetailsRedirectProps {
  reservation: ReservationType;
  openReservationDeleteModal: (deleteReservation: ReservationType) => void;
  className?: string;
  linkClassNames?: string;
  workUrl: URL;
  /**
   * TEMPORARY: whether the reservation may be given up at all - see
   * `usePublizonReservationsClosed`. Decided by the parent, which renders this
   * row once per breakpoint and states the reason once. Required rather than
   * defaulted so that removing the freeze fails to compile here.
   */
  cancellable: boolean;
}

const ReservationDetailsRedirect: FC<
  ReservationDetailsRedirectProps & MaterialProps
> = ({
  reservation,
  openReservationDeleteModal,
  className,
  linkClassNames,
  workUrl,
  cancellable
}) => {
  const t = useText();

  return (
    <div className={`modal-details__buttons ${className}`}>
      <Button
        buttonType="none"
        label={t("reservationDetailsRemoveDigitalReservationText")}
        size="small"
        variant="outline"
        collapsible={false}
        disabled={!cancellable}
        onClick={() => openReservationDeleteModal(reservation)}
        classNames={linkClassNames}
        dataCy="remove-digital-reservation-button"
      />
      <LinkButton
        dataCy="view-material-button"
        size="small"
        url={workUrl}
        variant="filled"
        id="view-material-button"
        iconClassNames="btn-icon invert"
      >
        {t("viewMaterialText")}
      </LinkButton>
    </div>
  );
};

export default ReservationDetailsRedirect;
