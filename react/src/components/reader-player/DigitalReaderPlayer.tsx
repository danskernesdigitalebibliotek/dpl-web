import React, { useState } from "react";
import { opensIn } from "@danskernesdigitalebibliotek/dpl-service-layer";
import type {
  WedoBooksSessionInterruption,
  WedoBooksStopReason
} from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useDigitalCheckout from "./useDigitalCheckout";
import DigitalReader from "./DigitalReader";
import DigitalPlayer from "./DigitalPlayer";
import DigitalSessionStopped from "./DigitalSessionStopped";
import DeviceLimitReached from "./DeviceLimitReached";

export type DigitalReaderPlayerProps = {
  /** The loan to open, which is also the SDK's checkout id. */
  loanId: string;
  onClose: () => void;
};

/**
 * Opens a digital loan in the reader or the player, decided from the loan
 * itself: the SDK's checkout carries the material type, so a pasted url opens
 * the right thing no matter which page it names.
 *
 * The player gets a page rather than a modal: the SDK's player bar pins itself
 * to the bottom of the viewport, which leaves a wrapping modal empty, and a
 * bar over the material page would promise playback across full page loads.
 *
 * The SDK may also not show the loan at all: it closes what it mounted when
 * the session moves elsewhere, and refuses to open when the patron has no room
 * for this device. Either way nothing is on the page, so the reason is shown
 * instead - with a way to free a device, after which the loan is opened again.
 * `onClose` is only called for a close the patron chose.
 */
const DigitalReaderPlayer: React.FC<DigitalReaderPlayerProps> = ({
  loanId,
  onClose
}) => {
  const { sdk, checkout } = useDigitalCheckout(loanId);
  // Why the SDK is not showing the loan, while it is not.
  const [stop, setStop] = useState<WedoBooksStopReason | null>(null);
  // Counts the attempts to open, so a retry mounts the reader or player anew.
  const [attempt, setAttempt] = useState(0);

  const handleClose = (interruption?: WedoBooksSessionInterruption) => {
    if (interruption) {
      setStop(interruption);
      return;
    }
    onClose();
  };

  const retry = () => {
    setStop(null);
    setAttempt((count) => count + 1);
  };

  // No spinner: the reader and player render nothing during their own load
  // anyway, so returning null here adds no visible wait.
  if (!sdk || !checkout) return null;

  if (stop?.reason === "device_limit_reached") {
    return (
      <DeviceLimitReached sdk={sdk} onDeviceRemoved={retry} onClose={onClose} />
    );
  }

  if (stop) {
    return (
      <DigitalSessionStopped reason={stop} onRetry={retry} onClose={onClose} />
    );
  }

  switch (opensIn(checkout.material_type)) {
    case "player":
      return (
        <DigitalPlayer
          key={attempt}
          sdk={sdk}
          checkout={checkout}
          onClose={handleClose}
          onOpenError={setStop}
        />
      );
    case "reader":
      return (
        <DigitalReader
          key={attempt}
          sdk={sdk}
          checkout={checkout}
          onClose={handleClose}
          onOpenError={setStop}
        />
      );
    // A type nothing can open gets no button in the loan list either.
    default:
      return null;
  }
};

export default DigitalReaderPlayer;
