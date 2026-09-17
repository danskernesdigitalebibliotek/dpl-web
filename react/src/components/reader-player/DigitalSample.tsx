import React, { Suspense } from "react";
import useDigitalSampleProps from "./useDigitalSampleProps";

// Loaded on demand - see DigitalReader.
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

export type DigitalSampleProps = {
  /** The material to sample, by the identifier the catalogue knows it under. */
  identifier: string;
  onClose: () => void;
};

/**
 * Samples a digital material through WeDoBooks - for anyone, signed in or not.
 *
 * The adapter answers samples for a library token and hands back the file
 * itself, which the SDK opens without a session. Sampling is therefore the one
 * thing a visitor can do with a digital material before borrowing it.
 *
 * Whether that file reads or plays is decided by the file, the way
 * `DigitalReaderPlayer` lets the loan decide: a sample carries no material
 * type of its own, and the adapter knows what the material is better than the
 * link that was followed to get here.
 */
const DigitalSample: React.FC<DigitalSampleProps> = ({
  identifier,
  onClose
}) => {
  const sdkProps = useDigitalSampleProps(identifier);

  // Nothing to render until the file and its catalogue record are in hand. The
  // reader and player draw their own loading state once mounted, so showing
  // one here as well would only make the wait look like two waits.
  if (!sdkProps) return null;

  const SdkSample =
    sdkProps.format === "mp3" ? SdkSamplePlayer : SdkSampleReader;

  return (
    <Suspense fallback={null}>
      <SdkSample
        sdk={sdkProps.sdk}
        sampleUrl={sdkProps.sampleUrl}
        material={sdkProps.material}
        onClose={onClose}
      />
    </Suspense>
  );
};

export default DigitalSample;
