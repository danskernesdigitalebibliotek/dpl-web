import React from "react";
import { onlineInternalModalId } from "../../apps/material/helper";
import Modal from "../../core/utils/modal";
import { useText } from "../../core/utils/text";
import { Manifestation } from "../../core/utils/types/entities";
import OnlineInternalModalBody from "./OnlineInternalModalBody";
import { WorkId } from "../../core/utils/types/ids";
import { getDigitalLoanEdition } from "../../core/utils/helpers/digital-loan-edition";

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
  // Nothing opens a loan modal for an edition we cannot lend.
  const edition = getDigitalLoanEdition([manifestation]);
  if (!edition) return null;

  return (
    <Modal
      modalId={onlineInternalModalId(edition)}
      screenReaderModalDescriptionText={t(
        "onlineInternalModalScreenReaderDescriptionText"
      )}
      closeModalAriaLabelText={t("onlineInternalModalCloseAriaLabelText")}
      dataCy={dataCy || "online-internal-modal"}
      classNames="modal-cta"
    >
      <OnlineInternalModalBody edition={edition} workId={workId} />
    </Modal>
  );
};

export default OnlineInternalModal;
