import { useConfig } from "./config";
import { isConfigValueOne } from "../../components/reservation/helper";

/**
 * The CMS feature flags the apps read. Spelled out so a misspelled key is a
 * compile error rather than a flag that silently reads as off.
 */
type ConfigFlag = "useBiblioAdapterConfig" | "publizonReservationsClosedConfig";

/**
 * A boolean feature flag the CMS ships as a data attribute.
 *
 * Only the CMS's own "1" counts, so a typo cannot switch a library over, and
 * a site whose CMS release predates the flag supplies no such key at all -
 * `useConfig` throws for a key it does not have, which for a flag means "not
 * enabled" rather than an error.
 *
 * Note what that costs a flag that closes something: an attribute the CMS
 * stops shipping reads as off rather than as a fault, so
 * `publizonReservationsClosedConfig` would silently re-open the queue. The
 * key union above is what guards the React side of that; the CMS side is held
 * only by `ReactAppsHooks` always emitting the attribute.
 */
const useConfigFlag = (key: ConfigFlag): boolean => {
  const config = useConfig();

  try {
    return isConfigValueOne(config(key));
  } catch {
    return false;
  }
};

export default useConfigFlag;
