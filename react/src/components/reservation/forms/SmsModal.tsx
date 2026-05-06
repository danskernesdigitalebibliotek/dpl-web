import React from "react";
import { PatronInfo } from "@dpl/fbs";
import { useText } from "../../../core/utils/text";
import ModalReservationFormText from "./ModalReservationFormText";

export interface SmsModalProps {
  patron: PatronInfo;
}

const SmsModal = ({ patron, patron: { phoneNumber } }: SmsModalProps) => {
  const t = useText();
  return (
    <ModalReservationFormText
      type="sms"
      defaultText={phoneNumber}
      header={{
        title: t("modalReservationFormSmsHeaderTitleText"),
        description: [t("modalReservationFormSmsHeaderDescriptionText")]
      }}
      inputField={{
        label: t("modalReservationFormSmsInputFieldLabelText"),
        description: t("modalReservationFormSmsInputFieldDescriptionText")
      }}
      patron={patron}
    />
  );
};

export default SmsModal;
