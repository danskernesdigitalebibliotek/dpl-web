import {
  useDigitalMaterial,
  useDigitalSample,
  type DigitalSampleFormat
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import type {
  WedoBooksSampleMaterial,
  WedoBooksSdk
} from "@danskernesdigitalebibliotek/dpl-wedobooks";
import useWedoBooksSdk from "./useWedoBooksSdk";

type SampleMount = {
  sdk: WedoBooksSdk;
  /** The adapter's own word on what the material is - epub reads, mp3 plays. */
  format: DigitalSampleFormat;
  sampleUrl: string;
  material: WedoBooksSampleMaterial;
};

/**
 * Everything it takes to open a sample, or null while that is not yet
 * everything - all of it available to a visitor who is not signed in.
 *
 * A url-opened sample bypasses WeDoBooks' catalogue entirely, so the fields it
 * shows have to come from ours: the adapter answers the excerpt and its
 * catalogue record separately, and both are needed before mounting. A sample
 * with no title would open an unnamed book.
 */
const useDigitalSampleMount = (identifier: string): SampleMount | null => {
  const { data: sdk } = useWedoBooksSdk();
  const { data: sample } = useDigitalSample(identifier);
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

export default useDigitalSampleMount;
