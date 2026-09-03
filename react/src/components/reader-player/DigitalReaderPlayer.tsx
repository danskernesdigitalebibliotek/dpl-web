import React from "react";
import useReaderCheckout from "./useReaderCheckout";
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
 * Audiobooks get a page rather than a modal: the SDK's player bar pins itself
 * to the bottom of the viewport, which leaves a wrapping modal empty, and a
 * bar over the material page would promise playback across full page loads.
 */
const DigitalReaderPlayer: React.FC<DigitalReaderPlayerProps> = ({
  loanId,
  onClose
}) => {
  const { sdk, checkout } = useReaderCheckout(loanId);

  // No spinner: the reader and player render nothing during their own load
  // anyway, so returning null here adds no visible wait.
  if (!sdk || !checkout) return null;

  // String() rather than importing the SDK's MaterialType enum: a value
  // import would statically link the multi-megabyte SDK chunk into the page
  // bundle that this component exists to keep it out of.
  if (String(checkout.material_type) === "audiobook") {
    return <DigitalPlayer sdk={sdk} checkout={checkout} onClose={onClose} />;
  }

  return <DigitalReader sdk={sdk} checkout={checkout} onClose={onClose} />;
};

export default DigitalReaderPlayer;
