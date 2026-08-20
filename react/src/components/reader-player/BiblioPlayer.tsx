import React, { Suspense } from "react";
import useWedoBooksCheckout from "../../core/biblio/useWedoBooksCheckout";

const WedoBooksPlayer = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksPlayer
  }))
);

export type BiblioPlayerProps = {
  /** The Biblio loan to play, which is also the SDK's checkout id. */
  loanId: string;
  onClose: () => void;
};

/**
 * The audiobook player for a loan made through the Biblio adapter.
 *
 * The counterpart to `Player`, which plays Publizon loans in pubhub's iframe.
 * See `BiblioReader` for why the loan, not the library, decides which one runs.
 */
const BiblioPlayer: React.FC<BiblioPlayerProps> = ({ loanId, onClose }) => {
  const { sdk, checkout } = useWedoBooksCheckout(loanId);

  if (!sdk || !checkout) return null;

  return (
    <Suspense fallback={null}>
      <WedoBooksPlayer sdk={sdk} checkout={checkout} onClose={onClose} />
    </Suspense>
  );
};

export default BiblioPlayer;
