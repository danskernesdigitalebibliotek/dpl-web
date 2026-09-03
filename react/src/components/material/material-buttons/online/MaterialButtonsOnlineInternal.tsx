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
import { isAnonymous } from "../../../../core/utils/helpers/user";
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
import { useModalIdsToCloseForReservation } from "../../../../core/utils/useModalIdsToCloseForReservation";

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
  // With the flag on, the service layer is the lending provider, so a
  // signed-in patron samples through it on the reader or player page - and Publizon
  // must not stand in for anyone. Samples are only answered for a signed-in
  // session, so an anonymous visitor gets a disabled button until an
  // anonymous sample exists.
  const samplesThroughServiceLayer = viaBiblioAdapter && !isAnonymous();
  const samplingUnavailable = viaBiblioAdapter && isAnonymous();
  const { open } = useModalButtonHandler();
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
    canBeSampled,
    reservation,
    isLoading
  } = useReaderPlayer(getLoanableManifestation(manifestations));

  const handleModalLoanReservation = useOnlineInternalHandleLoanReservation({
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
    if (!identifier || isLoading) return <MaterialButtonLoading />;

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

    return renderUnavailableButton(`${dataCy}-reader`);
  };

  // The providers have answered and nothing applies: the material can
  // neither be opened nor acquired right now. A disabled button says so -
  // the spinner this used to fall back to promised an answer that had
  // already arrived.
  const renderUnavailableButton = (buttonDataCy: string) => (
    <Button
      dataCy={buttonDataCy}
      label={loanLabel}
      buttonType="none"
      variant="filled"
      size={size || "large"}
      onClick={() => {}}
      disabled
      collapsible={false}
    />
  );

  // The disabled stand-in both teasers show while sampling is unavailable -
  // identical apart from which teaser it stands in for.
  const renderDisabledTeaserButton = (teaserDataCy: string) => (
    <Button
      dataCy={teaserDataCy}
      label={tryLabel}
      buttonType="none"
      variant="outline"
      size={size || "large"}
      onClick={() => {}}
      disabled
      collapsible={false}
    />
  );

  const renderReaderTeaserButton = () => {
    if (!openModal) return null;
    // Wait for the providers before deciding: a teaser that shows while the
    // loan is still being looked up would flash and vanish.
    if (!identifier || isLoading) return <MaterialButtonLoading />;
    if (isAlreadyLoaned) return null;
    // A material the lending provider does not know has no sample to offer -
    // hiding the teaser beats opening an empty reader or player.
    if (!canBeSampled) return null;

    if (samplingUnavailable) {
      return renderDisabledTeaserButton(`${dataCy}-reader-teaser`);
    }

    return (
      <MaterialSecondaryLink
        label={tryLabel}
        size={size || "large"}
        url={sampleUrl(identifier, "ebook")}
        dataCy={`${dataCy}-reader-teaser`}
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

  const renderPlayerButton = () => {
    if (!identifier || isLoading) return <MaterialButtonLoading />;

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

    return renderUnavailableButton(`${dataCy}-player`);
  };

  const renderPlayerTeaserButton = () => {
    if (!openModal) return null;
    // Wait for the providers before deciding: a teaser that shows while the
    // loan is still being looked up would flash and vanish.
    if (!identifier || isLoading) return <MaterialButtonLoading />;
    if (isAlreadyLoaned) return null;
    // A material the lending provider does not know has no sample to offer -
    // hiding the teaser beats opening an empty reader or player.
    if (!canBeSampled) return null;

    if (samplingUnavailable) {
      return renderDisabledTeaserButton(`${dataCy}-player-teaser`);
    }

    // The SDK's player pins itself to the bottom of the viewport, which
    // leaves a wrapping modal empty - so a digital sample gets the player
    // page, exactly like a digital loan does.
    if (samplesThroughServiceLayer) {
      return (
        <MaterialSecondaryLink
          label={tryLabel}
          size={size || "large"}
          url={sampleUrl(identifier, "audiobook")}
          dataCy={`${dataCy}-player-teaser`}
          trackClick={() =>
            track("click", {
              id: statistics.publizonTry.id,
              name: statistics.publizonTry.name,
              trackedData: workId
            })
          }
        />
      );
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
