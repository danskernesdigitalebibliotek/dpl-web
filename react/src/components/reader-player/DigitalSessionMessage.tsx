import React from "react";
import { useText } from "../../core/utils/text";
import { Button } from "../Buttons/Button";

export type DigitalSessionMessageProps = {
  text: string;
  onClose: () => void;
  /** Anything the patron can act on besides leaving, such as a device list. */
  children?: React.ReactNode;
};

/**
 * What stands in for a reader or player the SDK will not show: one sentence
 * on why, whatever the patron can do about it, and a way back.
 */
const DigitalSessionMessage: React.FC<DigitalSessionMessageProps> = ({
  text,
  onClose,
  children
}) => {
  const t = useText();

  return (
    <section className="px-16 py-48">
      <p className="text-body-large">{text}</p>
      {children && <div className="mt-32">{children}</div>}
      <div className="mt-32">
        <Button
          label={t("digitalSessionInterruptedCloseButtonText")}
          buttonType="none"
          collapsible={false}
          size="small"
          variant="filled"
          onClick={onClose}
        />
      </div>
    </section>
  );
};

export default DigitalSessionMessage;
