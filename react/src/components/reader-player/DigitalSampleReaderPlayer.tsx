import React, { Suspense } from "react";
import useReaderSdk from "../../core/digital/useReaderSdk";

// Loaded on demand for the same reason as the loan reader: the SDK carries a
// reading framework, Firebase and a component library, and only someone
// sampling a book needs any of it.
const SdkSampleReader = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksSampleReader
  }))
);
const SdkSamplePlayer = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksSamplePlayer
  }))
);

export type DigitalSampleReaderPlayerProps = {
  /** The material to sample, by the identifier the catalogue knows it under. */
  identifier: string;
  /** A sample has no loan to read the type from, so the caller says. */
  materialType: "ebook" | "audiobook";
  onClose: () => void;
};

/**
 * Samples a material through WeDoBooks, for a signed-in patron.
 *
 * The counterpart to Publizon's identifier-mode reader and player. A sample
 * has no entitlement behind it, so unlike `DigitalReaderPlayer` there is no
 * checkout to decide from - the link carries the material type instead.
 *
 * Signed-in only: WeDoBooks answers sample URLs solely for an authenticated
 * session, so anonymous visitors keep Publizon's sample until that changes.
 */
const DigitalSampleReaderPlayer: React.FC<DigitalSampleReaderPlayerProps> = ({
  identifier,
  materialType,
  onClose
}) => {
  const { data: sdk } = useReaderSdk();

  // Nothing to render until the session is in hand. The SDK draws its own
  // loading state once mounted, so showing one here as well would only make
  // the wait look like two waits.
  if (!sdk) return null;

  return (
    <Suspense fallback={null}>
      {materialType === "audiobook" ? (
        <SdkSamplePlayer sdk={sdk} materialId={identifier} onClose={onClose} />
      ) : (
        <SdkSampleReader sdk={sdk} materialId={identifier} onClose={onClose} />
      )}
    </Suspense>
  );
};

export default DigitalSampleReaderPlayer;
