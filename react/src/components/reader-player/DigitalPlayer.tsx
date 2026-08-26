import React, { Suspense } from "react";
import useReaderCheckout from "../../core/digital/useReaderCheckout";

const SdkPlayer = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksPlayer
  }))
);

export type DigitalPlayerProps = {
  /** The loan to play, which is also the SDK's checkout id. */
  loanId: string;
  onClose: () => void;
};

/**
 * The audiobook player for a loan the service layer issued.
 *
 * The counterpart to `Player`, which plays Publizon loans in pubhub's iframe.
 * See `DigitalReader` for why the loan, not the library, decides which one
 * runs.
 */
const DigitalPlayer: React.FC<DigitalPlayerProps> = ({ loanId, onClose }) => {
  const { sdk, checkout } = useReaderCheckout(loanId);

  if (!sdk || !checkout) return null;

  return (
    <Suspense fallback={null}>
      <SdkPlayer sdk={sdk} checkout={checkout} onClose={onClose} />
    </Suspense>
  );
};

export default DigitalPlayer;
