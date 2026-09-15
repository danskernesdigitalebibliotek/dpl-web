import React, { Suspense } from "react";
import {
  useDigitalMaterial,
  useDigitalSample
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useDigitalSdk from "./useDigitalSdk";

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
  const { data: sdk } = useDigitalSdk();
  // The query keeps failures quiet for the teaser's sake, where a missing
  // excerpt just means no offer. Here the excerpt is the page, so a failure
  // has to be seen: without this it renders as nothing at all, which is
  // indistinguishable from still loading and never resolves.
  const { data: sample } = useDigitalSample(identifier, {
    throwOnError: true
  });
  // A url-opened sample bypasses WeDoBooks' catalogue entirely, so the fields
  // it shows have to come from ours. A sample with no title would open an
  // unnamed book.
  const { data: material } = useDigitalMaterial(identifier);

  // Nothing to render until the file and its catalogue record are in hand. The
  // reader and player draw their own loading state once mounted, so showing
  // one here as well would only make the wait look like two waits.
  if (!sdk || !sample || !material) return null;

  // The adapter's own word on what the material is - epub reads, mp3 plays.
  const SdkSample = sample.format === "mp3" ? SdkSamplePlayer : SdkSampleReader;

  return (
    <Suspense fallback={null}>
      <SdkSample
        sdk={sdk}
        sampleUrl={sample.url}
        material={{
          material_id: material.isbn,
          title: material.title,
          author: material.authors
        }}
        onClose={onClose}
      />
    </Suspense>
  );
};

export default DigitalSample;
