import { HoldingsLogistics } from "@dpl/service-layer/fbs";

export const getLocationArray = (
  holdingsLogistics: HoldingsLogistics
): string[] => {
  const { logisticsPlacement, lmsPlacement } = holdingsLogistics;

  if (logisticsPlacement?.length) {
    return (
      logisticsPlacement
        // Remove the first element, which is always the library name
        .slice(1)
        .filter((item): item is string => Boolean(item))
    );
  }

  if (lmsPlacement) {
    const { department, location, sublocation } = lmsPlacement;
    return [department?.title, location?.title, sublocation?.title].filter(
      (item): item is string => Boolean(item)
    );
  }

  return [];
};

export const getFindOnShelfLocationText = (
  locationArray: (string | undefined)[]
) => {
  return locationArray.join(" · ");
};

export default {};
