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
 * Opens a digital loan in whichever component its material type calls for.
 *
 * The reader and player pages are reached with nothing but a loan id, so the
 * loan itself answers whether it reads or plays: the SDK's checkout carries
 * the material type. Deciding here rather than trusting the address keeps
 * deep links working - a pasted url opens the right thing no matter which
 * page it names.
 *
 * Audiobooks get a page rather than a modal on purpose. The SDK's player bar
 * pins itself to the bottom of the viewport regardless of where it is
 * mounted, which leaves a wrapping modal empty - and a bar overlaid on the
 * material page would promise Spotify-style playback across navigation that
 * full page loads cannot deliver. A dedicated page frames the truth: leaving
 * it ends playback, exactly like closing the e-book reader.
 */
const DigitalReaderPlayer: React.FC<DigitalReaderPlayerProps> = ({
  loanId,
  onClose
}) => {
  const { sdk, checkout } = useReaderCheckout(loanId);

  // Nothing to decide from until the session and the entitlement are here.
  // The reader and player render nothing during their own load anyway, so
  // this adds no wait.
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
