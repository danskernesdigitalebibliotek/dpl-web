import {
  useDigitalMaterial,
  useDigitalSample,
  type DigitalSampleFormat
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import type {
  WedoBooksSampleMaterial,
  WedoBooksSdk
} from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useDigitalSdk from "./useDigitalSdk";

type SdkSampleProps = {
  sdk: WedoBooksSdk;
  /** The adapter's own word on what the material is - epub reads, mp3 plays. */
  format: DigitalSampleFormat;
  sampleUrl: string;
  material: WedoBooksSampleMaterial;
};

/**
 * What the SDK's sample reader or player takes as props, or null while not
 * all of it is in hand - all of it available to a visitor who is not signed in.
 *
 * A url-opened sample bypasses WeDoBooks' catalogue entirely, so the fields it
 * shows have to come from ours: the adapter answers the excerpt and its
 * catalogue record separately, and both are needed before rendering. A sample
 * with no title would open an unnamed book.
 */
const useDigitalSampleProps = (identifier: string): SdkSampleProps | null => {
  const { data: sdk } = useDigitalSdk();
  // The query keeps failures quiet for the teaser's sake, where a missing
  // excerpt just means no offer. Here the excerpt is the page, so a failure
  // has to be seen: without this it renders as nothing at all, which is
  // indistinguishable from still loading and never resolves.
  const { data: sample } = useDigitalSample(identifier, {
    throwOnError: true
  });
  const { data: material } = useDigitalMaterial(identifier);

  if (!sdk || !sample || !material) return null;

  return {
    sdk,
    format: sample.format,
    sampleUrl: sample.url,
    material: {
      material_id: material.isbn,
      title: material.title,
      author: material.authors
    }
  };
};

export default useDigitalSampleProps;
