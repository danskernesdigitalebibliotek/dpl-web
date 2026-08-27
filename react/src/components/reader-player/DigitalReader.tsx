import React, { Suspense } from "react";
import type {
  WedoBooksCheckout,
  WedoBooksSdk
} from "@danskernesdigitalebibliotek/dpl-wedobooks";

// Loaded on demand: the SDK carries a reading framework, Firebase and a
// component library, and only someone opening a book needs any of it.
const SdkReader = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksReader
  }))
);

export type DigitalReaderProps = {
  /** The signed-in SDK session the loan lives in. */
  sdk: WedoBooksSdk;
  /** The entitlement to open - fetched once by DigitalReaderPlayer. */
  checkout: WedoBooksCheckout;
  onClose: () => void;
};

/**
 * The reader for a loan the service layer issued.
 *
 * The counterpart to `Reader`, which opens Publizon loans in pubhub's reader.
 * The two are not interchangeable - neither service recognises the other's
 * loans - so which one to render is decided from the loan, not from the
 * library's current provider.
 */
const DigitalReader: React.FC<DigitalReaderProps> = ({
  sdk,
  checkout,
  onClose
}) => {
  return (
    <Suspense fallback={null}>
      <SdkReader
        sdk={sdk}
        checkout={checkout}
        onClose={onClose}
        // Finishing a book ends nothing yet: neither the adapter nor the SDK's
        // library flow exposes a way to hand a loan back early, so it runs to
        // its expiry. Closing is the honest response until one of them does.
        onFinishBook={onClose}
      />
    </Suspense>
  );
};

export default DigitalReader;
