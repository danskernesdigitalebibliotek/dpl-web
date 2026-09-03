import React, { Suspense } from "react";
import useReaderSdk from "./useReaderSdk";

// Loaded on demand - see DigitalReader.
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
 * Samples an e-book through WeDoBooks, for a signed-in patron - WeDoBooks
 * answers sample URLs for authenticated sessions only.
 *
 * A sample has no checkout to read a material type from, so the route decides:
 * e-book samples live on the reader page, audiobooks on `DigitalSamplePlayer`.
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
