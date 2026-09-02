import { useConfig } from "./config";

/**
 * A boolean feature flag the CMS ships as a data attribute.
 *
 * Only the CMS's own "1" counts, so a typo cannot switch a library over, and
 * a site whose CMS release predates the flag supplies no such key at all -
 * `useConfig` throws for a key it does not have, which for a flag means "not
 * enabled" rather than an error.
 */
const useConfigFlag = (key: string): boolean => {
  const config = useConfig();

  try {
    return config(key) === "1";
  } catch {
    return false;
  }
};

export default useConfigFlag;
