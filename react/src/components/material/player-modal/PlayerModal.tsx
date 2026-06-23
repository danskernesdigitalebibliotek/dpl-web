import React, { FC } from "react";
import { createPortal } from "react-dom";
import Modal from "../../../core/utils/modal";
import { useText } from "../../../core/utils/text";
import Player, { PlayerType } from "../../reader-player/Player";
import { playerModalId } from "./helper";

const PlayerModal: FC<PlayerType> = ({ identifier, orderId }) => {
  const t = useText();
  const id = orderId ?? identifier;
  if (!id) return null;

  // Portal to document.body so the modal escapes any parent stacking context
  // (e.g. when mounted inside a list row inside a <ul>). Without the portal
  // the modal ends up trapped behind the site header / footer.
  return createPortal(
    <Modal
      classNames="modal--center"
      dataCy="player-modal"
      modalId={playerModalId(id)}
      screenReaderModalDescriptionText={t("playerModalDescriptionText")}
      closeModalAriaLabelText={t("playerModalCloseButtonText")}
    >
      {orderId ? (
        <Player orderId={orderId} />
      ) : (
        <Player identifier={identifier} />
      )}
    </Modal>,
    document.body
  );
};

export default PlayerModal;
