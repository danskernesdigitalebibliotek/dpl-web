import React, { Suspense } from "react";
import useReaderSdk from "./useReaderSdk";

// Loaded on demand for the same reason as the loan reader: the SDK carries a
// reading framework, Firebase and a component library, and only someone
// sampling a book needs any of it.
const SdkSampleReader = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksSampleReader
  }))
);

export type DigitalSampleReaderProps = {
  /** The material to sample, by the identifier the catalogue knows it under. */
  identifier: string;
  onClose: () => void;
};

/**
 * Samples an e-book through WeDoBooks, for a signed-in patron.
 *
 * The counterpart to Publizon's identifier-mode reader. A sample has no
 * entitlement behind it, so unlike `DigitalReaderPlayer` there is no checkout
 * to decide from - the route already did: e-book samples live on the reader
 * page, audiobook samples on the player page (`DigitalSamplePlayer`).
 *
 * Signed-in only: WeDoBooks answers sample URLs solely for an authenticated
 * session, so anonymous visitors keep Publizon's sample until that changes.
 */
const DigitalSampleReader: React.FC<DigitalSampleReaderProps> = ({
  identifier,
  onClose
}) => {
  const { data: sdk } = useReaderSdk();

  // Nothing to render until the session is in hand. The SDK draws its own
  // loading state once mounted, so showing one here as well would only make
  // the wait look like two waits.
  if (!sdk) return null;

  return (
    <Suspense fallback={null}>
      <SdkSampleReader sdk={sdk} materialId={identifier} onClose={onClose} />
    </Suspense>
  );
};

export default DigitalSampleReader;
