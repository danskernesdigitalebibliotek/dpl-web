import React, { FC, useState } from "react";
import { Manifestation } from "../../../../core/utils/types/entities";
import MaterialSecondaryLink from "../generic/MaterialSecondaryLink";
import MaterialSecondaryButton from "../generic/MaterialSecondaryButton";
import { playerModalId } from "../../player-modal/helper";
import { useModalButtonHandler } from "../../../../core/utils/modal";
import { useText } from "../../../../core/utils/text";
import { ButtonSize } from "../../../../core/utils/types/button";
import useReaderPlayer from "../../../../core/utils/useReaderPlayer";
import {
  playsInModal,
  readerUrl,
  sampleUrl
} from "../../../reader-player/helper";
import useBiblioAdapter from "../../../../core/utils/useBiblioAdapter";
import LinkButton from "../../../Buttons/LinkButton";
import { Button } from "../../../Buttons/Button";
import { getMaterialType } from "../../../../core/utils/helpers/general";
import { RequestStatus } from "../../../../core/utils/types/request";
import DeleteReservationModal, {
  deleteReservationModalId
} from "../../../../apps/reservation-list/modal/delete-reservation/delete-reservation-modal";
import { ReservationType } from "../../../../core/utils/types/reservation-type";
import useOnlineInternalHandleLoanReservation from "../../../../core/utils/useOnlineInternalHandleLoanReservation";
import { ApiResult, CreateLoanResult } from "../../../../core/publizon/model";
import { getLoanableManifestation } from "../../../../apps/material/helper";
import { WorkId } from "../../../../core/utils/types/ids";
import { useEventStatistics } from "../../../../core/statistics/useStatistics";
import { statistics } from "../../../../core/statistics/statistics";
import PlayerModal from "../../player-modal/PlayerModal";
import PlayerButton from "../../../reader-player/PlayerButton";
import MaterialButtonLoading from "../generic/MaterialButtonLoading";
import MaterialButtonDisabled from "../generic/MaterialButtonDisabled";
import { useModalIdsToCloseForReservation } from "../../../../core/utils/useModalIdsToCloseForReservation";
import useCanCancelReservation from "../../../../core/utils/useCanCancelReservation";

type MaterialButtonsOnlineInternalType = {
  size?: ButtonSize;
  manifestations: Manifestation[];
  dataCy?: string;
  openModal: boolean;
  setReservationStatus?: (status: RequestStatus) => void;
  setLoanResponse?: (response: CreateLoanResult | null) => void;
  setLoanStatus?: (status: RequestStatus) => void;
  setReservationOrLoanErrorResponse?: (error: ApiResult) => void;
  workId: WorkId;
  isEditionPicker?: boolean;
};

const MaterialButtonsOnlineInternal: FC<MaterialButtonsOnlineInternalType> = ({
  size,
  manifestations,
  dataCy = "material-button-online-internal",
  openModal,
  setReservationStatus,
  setLoanResponse,
  setLoanStatus,
  setReservationOrLoanErrorResponse,
  workId,
  isEditionPicker = false
}) => {
  const { track } = useEventStatistics();
  const t = useText();
  const viaBiblioAdapter = useBiblioAdapter();
  const { open } = useModalButtonHandler();
  const canCancelReservation = useCanCancelReservation();
  const modalsToClose = useModalIdsToCloseForReservation();
  const modalCloseOptions = isEditionPicker ? { modalsToClose } : undefined;

  const {
    type,
    orderId,
    holdingProvider,
    identifier,
    isAlreadyReserved,
    isAlreadyLoaned,
    canBeLoaned,
    canBeReserved,
    publizonReservationsClosed,
    canBeSampled,
    reservation,
    isLoading
  } = useReaderPlayer(getLoanableManifestation(manifestations));

  const { handleModalLoanReservation, isSubmitting } =
    useOnlineInternalHandleLoanReservation({
      manifestations,
      openModal,
      setReservationStatus,
      setLoanResponse,
      setLoanStatus,
      setReservationOrLoanErrorResponse,
      workId,
      modalsToClose: isEditionPicker ? modalsToClose : undefined
    });
  const [reservationToDelete, setReservationToDelete] =
    useState<ReservationType | null>(null);

  const isReady = Boolean(identifier) && !isLoading && !isSubmitting;

  const manifestationType = getMaterialType(manifestations);
  const reseveLabel = openModal
    ? t("reserveWithMaterialTypeText", {
        placeholders: { "@materialType": manifestationType }
      })
    : t("approveReservationText");

  const loanLabel = openModal
    ? t("loanWithMaterialTypeText", {
        placeholders: { "@materialType": manifestationType }
      })
    : t("approveLoanText");

  const tryLabel = t("onlineMaterialTeaserText", {
    placeholders: { "@materialType": manifestationType }
  });

  const renderReaderButton = () => {
    if (!isReady) return <MaterialButtonLoading />;

    // TEMPORARY: the queue this reservation lives in is frozen while Biblio
    // migrates it, so it cannot be given up yet. Delete this guard once the
    // freeze is lifted - see usePublizonReservationsClosed.
    if (reservation && !canCancelReservation(reservation)) {
      return (
        <MaterialButtonDisabled
          label={t("reservationDetailsRemoveDigitalReservationText")}
          reason={t("digitalReservationCancelClosedInfoText")}
          size={size}
          dataCy="remove-digital-reservation-button"
        />
      );
    }

    if (isAlreadyReserved && reservation) {
      return (
        <>
          <Button
            dataCy="remove-digital-reservation-button"
            label={t("reservationDetailsRemoveDigitalReservationText")}
            buttonType="none"
            size={size || "large"}
            variant="filled"
            collapsible={false}
            disabled={false}
            onClick={() => {
              setReservationToDelete(reservation);
              open(deleteReservationModalId(reservation), modalCloseOptions);
            }}
          />
        </>
      );
    }

    if (isAlreadyLoaned && orderId) {
      return (
        <LinkButton
          url={readerUrl(orderId, holdingProvider)}
          buttonType="none"
          variant="filled"
          size={size || "large"}
          dataCy={`${dataCy}-reader`}
          trackClick={() =>
            track("click", {
              id: statistics.publizonReadListen.id,
              name: statistics.publizonReadListen.name,
              trackedData: workId
            })
          }
        >
          {t("onlineMaterialReaderText", {
            placeholders: { "@materialType": manifestationType }
          })}
        </LinkButton>
      );
    }

    // TEMPORARY: the material would have been reservable, but the queue is
    // closed while Biblio migrates it. Answered before the acquire branch
    // below, which offers a not-signed-in visitor the loan so the login guard
    // can take over - that would promise an action this material cannot
    // honour. Delete this guard once the freeze is lifted - see
    // usePublizonReservationsClosed.
    if (publizonReservationsClosed) {
      return (
        <MaterialButtonDisabled
          label={reseveLabel}
          reason={t("digitalReservationsClosedInfoText")}
          size={size}
          dataCy={`${dataCy}-reader`}
        />
      );
    }

    if (canBeReserved || canBeLoaned) {
      return (
        <Button
          dataCy={`${dataCy}-reader`}
          label={canBeReserved ? reseveLabel : loanLabel}
          buttonType="none"
          variant="filled"
          size={size || "large"}
          onClick={handleModalLoanReservation}
          disabled={false}
          collapsible={false}
        />
      );
    }

    // Nothing applies: a disabled button, not a spinner - the answer is in.
    return (
      <MaterialButtonDisabled
        dataCy={`${dataCy}-reader`}
        label={loanLabel}
        size={size}
      />
    );
  };

  // Both teasers link to the sample page; only the route and the test handle
  // differ. The url carries the material type because the page it opens is
  // chosen before the adapter has said what the excerpt is.
  const renderSampleLink = (kind: "ebook" | "audiobook") => {
    // Guaranteed by the callers, which return early without one.
    if (!identifier) return null;

    return (
      <MaterialSecondaryLink
        label={tryLabel}
        size={size || "large"}
        url={sampleUrl(identifier, kind)}
        dataCy={`${dataCy}-${kind === "audiobook" ? "player" : "reader"}-teaser`}
        trackClick={() =>
          track("click", {
            id: statistics.publizonTry.id,
            name: statistics.publizonTry.name,
            trackedData: workId
          })
        }
      />
    );
  };

  // Whether a teaser can be shown at all, before deciding which one. Waits for
  // the providers: a teaser that shows while the loan is still being looked up
  // would flash and vanish.
  const sampleTeaserState = () => {
    if (!openModal) return "none";
    if (!identifier || isLoading) return "loading";
    if (isAlreadyLoaned) return "none";
    // Not every material has an excerpt - hiding the teaser beats opening an
    // empty reader or player.
    if (!canBeSampled) return "none";
    return "offer";
  };

  const renderReaderTeaserButton = () => {
    const state = sampleTeaserState();
    if (state === "loading") return <MaterialButtonLoading />;
    if (state !== "offer") return null;

    return renderSampleLink("ebook");
  };

  const renderPlayerButton = () => {
    if (!isReady) return <MaterialButtonLoading />;

    // TEMPORARY: the queue this reservation lives in is frozen while Biblio
    // migrates it, so it cannot be given up yet. Delete this guard once the
    // freeze is lifted - see usePublizonReservationsClosed.
    if (reservation && !canCancelReservation(reservation)) {
      return (
        <MaterialButtonDisabled
          label={t("reservationDetailsRemoveDigitalReservationText")}
          reason={t("digitalReservationCancelClosedInfoText")}
          size={size}
          dataCy="remove-digital-reservation-button"
        />
      );
    }

    if (isAlreadyReserved && reservation) {
      return (
        <>
          <Button
            dataCy="remove-digital-reservation-button"
            label={t("reservationDetailsRemoveDigitalReservationText")}
            buttonType="none"
            size={size || "large"}
            variant="filled"
            collapsible={false}
            disabled={false}
            onClick={() => {
              setReservationToDelete(reservation);
              open(deleteReservationModalId(reservation), modalCloseOptions);
            }}
          />
        </>
      );
    }

    if (isAlreadyLoaned && orderId) {
      return (
        <>
          {playsInModal(holdingProvider) && <PlayerModal orderId={orderId} />}
          <PlayerButton
            orderId={orderId}
            provider={holdingProvider}
            label={t("onlineMaterialPlayerText", {
              placeholders: { "@materialType": manifestationType }
            })}
            size={size || "large"}
            dataCy={`${dataCy}-player`}
            trackClick={() =>
              track("click", {
                id: statistics.publizonReadListen.id,
                name: statistics.publizonReadListen.name,
                trackedData: workId
              })
            }
            onPlayInModal={() =>
              open(playerModalId(orderId), modalCloseOptions)
            }
          />
        </>
      );
    }

    // TEMPORARY: the material would have been reservable, but the queue is
    // closed while Biblio migrates it. Answered before the acquire branch
    // below, which offers a not-signed-in visitor the loan so the login guard
    // can take over - that would promise an action this material cannot
    // honour. Delete this guard once the freeze is lifted - see
    // usePublizonReservationsClosed.
    if (publizonReservationsClosed) {
      return (
        <MaterialButtonDisabled
          label={reseveLabel}
          reason={t("digitalReservationsClosedInfoText")}
          size={size}
          dataCy={`${dataCy}-player`}
        />
      );
    }

    if (canBeReserved || canBeLoaned) {
      return (
        <Button
          dataCy={`${dataCy}-player`}
          label={canBeReserved ? reseveLabel : loanLabel}
          buttonType="none"
          variant="filled"
          size={size || "large"}
          onClick={handleModalLoanReservation}
          disabled={false}
          collapsible={false}
        />
      );
    }

    // Nothing applies: a disabled button, not a spinner - the answer is in.
    return (
      <MaterialButtonDisabled
        dataCy={`${dataCy}-player`}
        label={loanLabel}
        size={size}
      />
    );
  };

  const renderPlayerTeaserButton = () => {
    const state = sampleTeaserState();
    if (state === "loading") return <MaterialButtonLoading />;
    // The identifier is guaranteed by "offer" - the state reports "loading"
    // without one - but only the check narrows it for the Publizon branch.
    if (state !== "offer" || !identifier) return null;

    // With the flag on the service layer answers samples and Publizon must not
    // stand in. Audiobook samples play on the player page, like digital loans
    // - see DigitalReaderPlayer for why not a modal.
    if (viaBiblioAdapter) {
      return renderSampleLink("audiobook");
    }

    return (
      <>
        <PlayerModal identifier={identifier} />
        <MaterialSecondaryButton
          label={tryLabel}
          size={size || "large"}
          onClick={() => {
            track("click", {
              id: statistics.publizonTry.id,
              name: statistics.publizonTry.name,
              trackedData: workId
            });
            open(playerModalId(identifier), modalCloseOptions);
          }}
          dataCy={`${dataCy}-player-teaser`}
          ariaDescribedBy={t("onlineMaterialTeaserText")}
        />
      </>
    );
  };

  const renderDeleteReservationModal = () => {
    if (!reservationToDelete) return null;

    return (
      <DeleteReservationModal
        modalId={deleteReservationModalId(reservationToDelete)}
        reservations={[reservationToDelete]}
      />
    );
  };

  if (type === "reader") {
    return (
      <>
        {renderReaderButton()}
        {renderReaderTeaserButton()}
        {renderDeleteReservationModal()}
      </>
    );
  }

  if (type === "player") {
    return (
      <>
        {renderPlayerButton()}
        {renderPlayerTeaserButton()}
        {renderDeleteReservationModal()}
      </>
    );
  }

  return null;
};

export default MaterialButtonsOnlineInternal;
