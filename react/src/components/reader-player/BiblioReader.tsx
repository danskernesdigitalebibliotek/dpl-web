import React, { Suspense } from "react";
import useReaderCheckout from "../../core/digital/useReaderCheckout";

// Loaded on demand: the SDK carries a reading framework, Firebase and a
// component library, and only someone opening a book needs any of it.
const WedoBooksReader = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksReader
  }))
);

export type BiblioReaderProps = {
  /** The Biblio loan to open, which is also the SDK's checkout id. */
  loanId: string;
  onClose: () => void;
};

/**
 * The reader for a loan made through the Biblio adapter.
 *
 * The counterpart to `Reader`, which opens Publizon loans in pubhub's reader.
 * The two are not interchangeable - neither service recognises the other's
 * loans - so which one to render is decided from the loan, not from the
 * library's current provider.
 */
const BiblioReader: React.FC<BiblioReaderProps> = ({ loanId, onClose }) => {
  const { sdk, checkout } = useReaderCheckout(loanId);

  // Nothing to render until both the session and the entitlement are in hand.
  // The SDK draws its own loading state once mounted, so showing one here as
  // well would only make the wait look like two waits.
  if (!sdk || !checkout) return null;

  return (
    <Suspense fallback={null}>
      <WedoBooksReader
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

export default BiblioReader;
