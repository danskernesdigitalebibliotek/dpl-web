import React from "react";
import type { WedoBooksStopReason } from "@danskernesdigitalebibliotek/dpl-wedobooks";
import { useText } from "../../core/utils/text";
import { Button } from "../Buttons/Button";
import DigitalSessionMessage from "./DigitalSessionMessage";

export type DigitalSessionStoppedProps = {
  reason: WedoBooksStopReason;
  /** Open the loan again, where the reason allows it. */
  onRetry: () => void;
  onClose: () => void;
};

const textKeyFor = (reason: WedoBooksStopReason): string => {
  switch (reason.reason) {
    case "taken_over":
      // "Moved to another device" would be wrong for a tab of this browser.
      return reason.scope === "tab"
        ? "digitalSessionTakenOverTabText"
        : "digitalSessionTakenOverDeviceText";
    case "device_revoked":
      return "digitalSessionDeviceRevokedText";
    case "access_expired":
      return "digitalSessionAccessExpiredText";
    default:
      return "digitalSessionOpenFailedText";
  }
};

/**
 * What the patron sees in place of a reader or player the SDK will not show:
 * the session moved elsewhere, the loan expired while open, or the SDK refused
 * to open for a reason this page cannot act on. A browser removed from the
 * patron's devices is not a fault - opening again registers it anew - so that
 * one offers to.
 *
 * A full device list is the one stop the patron can do something about, and
 * has its own view - see DeviceLimitReached.
 */
const DigitalSessionStopped: React.FC<DigitalSessionStoppedProps> = ({
  reason,
  onRetry,
  onClose
}) => {
  const t = useText();

  return (
    <DigitalSessionMessage text={t(textKeyFor(reason))} onClose={onClose}>
      {reason.reason === "device_revoked" && (
        <Button
          label={t("digitalSessionOpenAgainButtonText")}
          buttonType="none"
          collapsible={false}
          size="small"
          variant="outline"
          onClick={onRetry}
        />
      )}
    </DigitalSessionMessage>
  );
};

export default DigitalSessionStopped;
