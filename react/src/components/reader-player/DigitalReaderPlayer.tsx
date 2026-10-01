import React from "react";
import { opensIn } from "@danskernesdigitalebibliotek/dpl-service-layer";
import useDigitalCheckout from "./useDigitalCheckout";
import DigitalReader from "./DigitalReader";
import DigitalPlayer from "./DigitalPlayer";

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
 */
const DigitalReaderPlayer: React.FC<DigitalReaderPlayerProps> = ({
  loanId,
  onClose
}) => {
  const { sdk, checkout } = useDigitalCheckout(loanId);

  // No spinner: the reader and player render nothing during their own load
  // anyway, so returning null here adds no visible wait.
  if (!sdk || !checkout) return null;

  if (opensIn(checkout.material_type) === "player") {
    return <DigitalPlayer sdk={sdk} checkout={checkout} onClose={onClose} />;
  }

  return <DigitalReader sdk={sdk} checkout={checkout} onClose={onClose} />;
};

export default DigitalReaderPlayer;
