import * as React from "react";
import { FC } from "react";
import { PatronSettings, PatronInfo } from "@dpl/service-layer/fbs";
import { useText } from "../../core/utils/text";
import CheckBox from "../checkbox/Checkbox";
import { ChangePatronProps } from "./types";
import TextInput from "../forms/input/TextInput";

export interface ContactInfoEmailProps {
  className?: string;
  patron: PatronInfo | PatronSettings | null;
  changePatron: ChangePatronProps;
  showCheckboxes: boolean;
  isRequired?: boolean;
}

const ContactInfoEmail: FC<ContactInfoEmailProps> = ({
  className = "",
  patron,
  changePatron,
  showCheckboxes,
  isRequired = false
}) => {
  const t = useText();
  return (
    <>
      <TextInput
        className={className}
        id="email-address-input"
        type="email"
        required={isRequired}
        onChange={(newEmail) => changePatron(newEmail, "emailAddress")}
        value={patron?.emailAddress}
        label={t("patronContactEmailLabelText")}
      />
      {showCheckboxes && (
        <CheckBox
          className="mt-8 mb-16"
          onChecked={(newReceiveEmail: boolean) =>
            changePatron(newReceiveEmail, "receiveEmail")
          }
          id="email-messages"
          selected={patron?.receiveEmail}
          disabled={false}
          label={t("patronContactEmailCheckboxText")}
        />
      )}
    </>
  );
};

export default ContactInfoEmail;
