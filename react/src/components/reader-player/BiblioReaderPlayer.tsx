import React from "react";
import useReaderCheckout from "../../core/digital/useReaderCheckout";
import BiblioReader from "./BiblioReader";
import BiblioPlayer from "./BiblioPlayer";

export type BiblioReaderPlayerProps = {
  /** The Biblio loan to open, which is also the SDK's checkout id. */
  loanId: string;
  onClose: () => void;
};

/**
 * Opens a Biblio loan in whichever component its material type calls for.
 *
 * The reader page is reached with nothing but a loan id, so the loan itself
 * answers whether it reads or plays: the SDK's checkout carries the material
 * type. Deciding here rather than in the link keeps deep links working - a
 * pasted reader url opens the right thing no matter which button made it.
 *
 * Audiobooks get a page rather than a modal on purpose. The SDK's player bar
 * pins itself to the bottom of the viewport regardless of where it is
 * mounted, which leaves a wrapping modal empty - and a bar overlaid on the
 * material page would promise Spotify-style playback across navigation that
 * full page loads cannot deliver. A dedicated page frames the truth: leaving
 * it ends playback, exactly like closing the e-book reader.
 */
const BiblioReaderPlayer: React.FC<BiblioReaderPlayerProps> = ({
  loanId,
  onClose
}) => {
  const { checkout } = useReaderCheckout(loanId);

  // Nothing to decide from until the entitlement is here. The reader and
  // player render nothing during their own load anyway, so this adds no wait.
  if (!checkout) return null;

  // String() rather than importing the SDK's MaterialType enum: a value
  // import would statically link the multi-megabyte SDK chunk into the page
  // bundle that this component exists to keep it out of.
  if (String(checkout.material_type) === "audiobook") {
    return <BiblioPlayer loanId={loanId} onClose={onClose} />;
  }

  return <BiblioReader loanId={loanId} onClose={onClose} />;
};

export default BiblioReaderPlayer;
