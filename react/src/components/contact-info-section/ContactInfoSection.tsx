import React, { FC } from "react";
import clsx from "clsx";
import { PatronInfo } from "@dpl/fbs";
import { PatronSettingsFormData } from "../../core/utils/useSavePatron";
import { useConfig } from "../../core/utils/config";
import ContactInfoInputs from "./ContactInfoInputs";
import ContactInfoPhone from "./ContactInfoPhone";
import ContactInfoEmail from "./ContactInfoEmail";
import { ChangePatronProps } from "./types";

interface ContactInfoSectionProps {
  patron: PatronInfo | PatronSettingsFormData | null;
  inLine?: boolean;
  isDouble?: boolean;
  changePatron: ChangePatronProps;
  showCheckboxes: ("email" | "phone")[];
  requiredFields?: ("email" | "phone")[];
}

const ContactInfoSection: FC<ContactInfoSectionProps> = ({
  patron,
  inLine = false,
  isDouble = false,
  changePatron,
  showCheckboxes,
  requiredFields = []
}) => {
  const inputsClass = clsx("dpl-input", [
    { input__desktop: inLine },
    { "dpl-input--double": isDouble }
  ]);
  const config = useConfig();
  const textNotificationsEnabledConfig =
    config("textNotificationsEnabledConfig") === "1";

  return (
    <section
      data-cy="patron-page-contact-info"
      className="create-patron-page__row"
    >
      <ContactInfoInputs isInline={inLine}>
        <ContactInfoPhone
          className={inputsClass}
          changePatron={changePatron}
          patron={patron}
          isRequired={requiredFields.includes("phone")}
          showCheckboxes={
            showCheckboxes.includes("phone") && textNotificationsEnabledConfig
          }
        />
        <ContactInfoEmail
          className={clsx(inputsClass, {
            "mt-32": !textNotificationsEnabledConfig && !inLine
          })}
          changePatron={changePatron}
          patron={patron}
          isRequired={requiredFields.includes("email")}
          showCheckboxes={showCheckboxes.includes("email")}
        />
      </ContactInfoInputs>
    </section>
  );
};

export default ContactInfoSection;
