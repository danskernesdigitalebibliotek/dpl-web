import React, { Suspense } from "react";
import useReaderSdk from "../../core/digital/useReaderSdk";

const SdkSamplePlayer = React.lazy(() =>
  import("@danskernesdigitalebibliotek/dpl-wedobooks").then((module) => ({
    default: module.WedoBooksSamplePlayer
  }))
);

export type DigitalSamplePlayerProps = {
  /** The material to sample, by the identifier the catalogue knows it under. */
  identifier: string;
  onClose: () => void;
};

/**
 * Samples an audiobook through WeDoBooks, for a signed-in patron.
 *
 * See `DigitalSampleReader` for why samples need no material type: the route
 * already carries it, and this page is the audiobook one.
 */
const DigitalSamplePlayer: React.FC<DigitalSamplePlayerProps> = ({
  identifier,
  onClose
}) => {
  const { data: sdk } = useReaderSdk();

  if (!sdk) return null;

  return (
    <Suspense fallback={null}>
      <SdkSamplePlayer sdk={sdk} materialId={identifier} onClose={onClose} />
    </Suspense>
  );
};

export default DigitalSamplePlayer;
