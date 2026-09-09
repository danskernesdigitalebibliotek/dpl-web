import React, { useState, FC } from "react";
import { useSelector } from "react-redux";
import { useDeepCompareEffect } from "react-use";
import { useText } from "../../../core/utils/text";
import {
  reservationId,
  ReservationType
} from "../../../core/utils/types/reservation-type";
import { getScrollClass } from "../../../core/utils/helpers/general";
import ReservationPauseToggler from "./reservation-pause-toggler";
import EmptyReservations from "./EmptyReservations";
import PauseReservation from "../modal/pause-reservation/pause-reservation";
import DeleteReservationModal, {
  deleteReservationModalId
} from "../modal/delete-reservation/delete-reservation-modal";
import DisplayedReservations from "./DisplayedReservations";
import {
  useModalButtonHandler,
  ModalIdsProps
} from "../../../core/utils/modal";
import MaterialDetailsModal, {
  reservationDetailsModalId
} from "../../loan-list/modal/material-details-modal";
import ReservationDetails from "../modal/reservation-details/reservation-details";
import { getUrlQueryParam } from "../../../core/utils/helpers/url";
import {
  getDetailsModalId,
  getModalIds
} from "../../../core/utils/helpers/modal-helpers";
import useReservations from "../../../core/utils/useReservations";
import ReservationListSkeleton from "./reservation-list-skeleton";
import { usePatronData } from "../../../core/utils/helpers/usePatronData";

export interface ReservationListProps {
  pageSize: number;
}

export const findReservationByModalParam = (
  reservations: ReservationType[],
  modalUrlParam: string | null,
  prefix: string
): ReservationType | null => {
  if (!modalUrlParam?.includes(prefix)) {
    return null;
  }

  const idFromUrl = getDetailsModalId(modalUrlParam, prefix);

  return (
    reservations.find(
      (reservation) => reservationId(reservation) === idFromUrl
    ) ?? null
  );
};

const ReservationList: FC<ReservationListProps> = ({ pageSize }) => {
  const t = useText();
  const { modalIds } = useSelector((s: ModalIdsProps) => s.modal);
  const { open } = useModalButtonHandler();
  const { pauseReservation, deleteReservation, reservationDetails } =
    getModalIds();
  const [reservationWithDetails, setReservationWithDetails] =
    useState<ReservationType | null>(null);
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservationType | null>(null);
  const { data: userData, isLoading: isLoadingUserData } = usePatronData();

  const {
    all: { reservations: allReservations, isLoading }
  } = useReservations();

  const allListsEmpty = allReservations.length === 0 && !isLoading;

  const openReservationDeleteModal = (reservationForModal: ReservationType) => {
    setReservationToDelete(reservationForModal);
    open(deleteReservationModalId(reservationForModal));
  };

  const openReservationDetailsModal = (
    reservationForModal: ReservationType
  ) => {
    setReservationWithDetails(reservationForModal);
    open(reservationDetailsModalId(reservationForModal));
  };

  // A modal renders only once we know which reservation it is about, so a
  // link straight to one has to be looked up before it can open.
  useDeepCompareEffect(() => {
    const modalUrlParam = getUrlQueryParam("modal");
    const details = findReservationByModalParam(
      allReservations,
      modalUrlParam,
      reservationDetails as string
    );
    if (details) {
      setReservationWithDetails(details);
    }

    const toDelete = findReservationByModalParam(
      allReservations,
      modalUrlParam,
      deleteReservation as string
    );
    if (toDelete) {
      setReservationToDelete(toDelete);
    }
  }, [allReservations, reservationDetails, deleteReservation]);

  return (
    <>
      <div className={`reservation-list-page ${getScrollClass(modalIds)}`}>
        <h1 className="text-header-h1 m-32">
          {t("reservationListHeaderText")}
        </h1>
        {/* Loading skeleton version of <ReservationPauseToggler /> */}
        {isLoadingUserData && (
          <div className="ssc">
            <div className="ssc-square w-90 ml-32 my-32" />
          </div>
        )}

        {userData?.patron && <ReservationPauseToggler user={userData.patron} />}

        {isLoading && allReservations.length === 0 && (
          <ReservationListSkeleton />
        )}

        {allListsEmpty && <EmptyReservations />}

        {!allListsEmpty && (
          <DisplayedReservations
            openReservationDetailsModal={openReservationDetailsModal}
            pageSize={pageSize}
          />
        )}
      </div>

      {/* Modals */}
      {userData?.patron && (
        <PauseReservation
          user={userData.patron}
          id={pauseReservation as string}
        />
      )}
      {reservationToDelete && (
        <DeleteReservationModal
          modalId={deleteReservationModalId(reservationToDelete)}
          reservations={[reservationToDelete]}
        />
      )}
      {reservationWithDetails && (
        <MaterialDetailsModal
          modalId={reservationDetailsModalId(reservationWithDetails)}
        >
          <ReservationDetails
            openReservationDeleteModal={openReservationDeleteModal}
            item={reservationWithDetails}
            reservation={reservationWithDetails}
          />
        </MaterialDetailsModal>
      )}
    </>
  );
};

export default ReservationList;
