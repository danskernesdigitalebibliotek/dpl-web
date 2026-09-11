import React, { Suspense } from "react";
import type {
  WedoBooksCheckout,
  WedoBooksSdk
} from "@danskernesdigitalebibliotek/dpl-wedobooks";

const SdkPlayer = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksPlayer
  }))
);

export type DigitalPlayerProps = {
  /** The signed-in SDK session the loan lives in. */
  sdk: WedoBooksSdk;
  /** The entitlement to play - fetched once by DigitalReaderPlayer. */
  checkout: WedoBooksCheckout;
  onClose: () => void;
};

/**
 * The audiobook player for a loan the service layer issued.
 *
 * The counterpart to `Player`, which plays Publizon loans in pubhub's iframe.
 * See `DigitalReader` for why the loan, not the library, decides which one
 * runs.
 */
const DigitalPlayer: React.FC<DigitalPlayerProps> = ({
  sdk,
  checkout,
  onClose
}) => {
  return (
    <Suspense fallback={null}>
      <SdkPlayer sdk={sdk} checkout={checkout} onClose={onClose} />
    </Suspense>
  );
};

export default DigitalPlayer;
