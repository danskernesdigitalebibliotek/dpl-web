import React from "react";
import { onlineInternalModalId } from "../../apps/material/helper";
import Modal from "../../core/utils/modal";
import { useText } from "../../core/utils/text";
import { Manifestation } from "../../core/utils/types/entities";
import OnlineInternalModalBody from "./OnlineInternalModalBody";
import { WorkId } from "../../core/utils/types/ids";
import { getDigitalLoanableManifestation } from "../../core/utils/helpers/digital-loanable-manifestation";

export type OnlineInternalModalProps = {
  manifestation: Manifestation;
  workId: WorkId;
  dataCy?: string;
};

const OnlineInternalModal = ({
  manifestation,
  workId,
  dataCy
}: OnlineInternalModalProps) => {
  const t = useText();
  // Nothing opens a loan modal for a manifestation we cannot lend.
  const loanableManifestation = getDigitalLoanableManifestation([
    manifestation
  ]);
  if (!loanableManifestation) return null;

  return (
    <Modal
      modalId={onlineInternalModalId(loanableManifestation)}
      screenReaderModalDescriptionText={t(
        "onlineInternalModalScreenReaderDescriptionText"
      )}
      closeModalAriaLabelText={t("onlineInternalModalCloseAriaLabelText")}
      dataCy={dataCy || "online-internal-modal"}
      classNames="modal-cta"
    >
      <OnlineInternalModalBody
        loanableManifestation={loanableManifestation}
        workId={workId}
      />
    </Modal>
  );
};

export default OnlineInternalModal;
