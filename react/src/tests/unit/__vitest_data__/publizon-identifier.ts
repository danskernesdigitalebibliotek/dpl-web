import { PublizonIdentifier } from "../../../core/utils/types/ids";

// Test data only: production code gets one from getPublizonIdentifier.
export const publizonIdentifier = (value: string) =>
  value as PublizonIdentifier;
