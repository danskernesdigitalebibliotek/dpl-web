import { uniqBy } from "lodash";
import {
  DashboardBlueRecommendationWorkFragment,
  GeneralMaterialTypeCodeEnum,
  useGetDashboardBlueRecommendationsQuery
} from "../../core/dbc-gateway/generated/graphql";
import { useUrls } from "../../core/utils/url";
import { recommendationQueryOptions } from "./recommendationQueryOptions";
import { RecommendationSeed } from "./recommendationSeed";
import { RecommendedWork } from "./recommendations.types";
import useRecommendationSource from "./useRecommendationSource";
import { toRecommendedWork } from "./toRecommendedWork";
import { hasValue } from "../../core/utils/helpers/has-value";

export type DigitalFormat = "ebook" | "audiobook";

/**
 * The seeds blue recommendations are based on. A patron who has used up their
 * quota for a format has at least this many loans in it, so there are always
 * three.
 */
export type BlueRecommendationSeeds = [
  RecommendationSeed,
  RecommendationSeed,
  RecommendationSeed
];

// Only about one in five recommendations is a blue title, so many more are
// fetched than the slider shows.
const FETCH_LIMIT = 100;

/**
 * Fetches "blue" (cost-free) recommended works based on three different recommendation seeds.
 *
 * @param recommendationSeeds The seeds on which the recommendations are based. These will typically be ISBNs of e-books or audiobooks the patron has loaned.
 * @param format Whether to look for e-books or audiobook recommendations
 *
 * @returns Returns blue (cost-free) recommendations ranked by the order of relevance.
 */
const useBlueRecommendations = (
  [firstSeed, secondSeed, thirdSeed]: BlueRecommendationSeeds,
  format: DigitalFormat
): RecommendedWork[] => {
  const u = useUrls();
  const materialUrl = u("materialUrl");

  // The recommendation seeds typically come from digital loans which only carry ISBNs.
  // We need to exchange these ISBN numbers for work ids that can be used in the `recommend` endpoint.
  const { source: firstSource } = useRecommendationSource(firstSeed);
  const { source: secondSource } = useRecommendationSource(secondSeed);
  const { source: thirdSource } = useRecommendationSource(thirdSeed);

  const { data } = useGetDashboardBlueRecommendationsQuery(
    {
      firstId: firstSource?.workId ?? "",
      secondId: secondSource?.workId ?? "",
      thirdId: thirdSource?.workId ?? "",
      limit: FETCH_LIMIT
    },
    {
      ...recommendationQueryOptions,
      enabled: Boolean(firstSource && secondSource && thirdSource)
    }
  );

  if (!data) {
    return [];
  }

  // Filters out recommendations that don't have blue (cost-free) manifestations
  const firstRecommendations = data.first.result
    .map(({ work }) => toBlueRecommendedWork(work, format, materialUrl))
    .filter(hasValue);

  const secondRecommendations = data.second.result
    .map(({ work }) => toBlueRecommendedWork(work, format, materialUrl))
    .filter(hasValue);

  const thirdRecommendations = data.third.result
    .map(({ work }) => toBlueRecommendedWork(work, format, materialUrl))
    .filter(hasValue);

  // The three recommendation results come back ranked by relevance. This
  // block builds a shared rank across all three lists.
  const rankedRecommendations = [
    ...firstRecommendations.map((work, index) => ({ work, rank: index })),
    ...secondRecommendations.map((work, index) => ({ work, rank: index })),
    ...thirdRecommendations.map((work, index) => ({ work, rank: index }))
  ]
    .toSorted((rec1, rec2) => rec1.rank - rec2.rank)
    .map(({ work }) => work);

  // The three different recommendation lists can potentially hold the same work.
  return uniqBy(rankedRecommendations, "workId");
};

/**
 * Mapping between the simplified `DigitalFormat` type and the GeneralMaterialTypeCodeEnum
 */
const formatByMaterialTypeCode: Partial<
  Record<GeneralMaterialTypeCodeEnum, DigitalFormat>
> = {
  [GeneralMaterialTypeCodeEnum.Ebooks]: "ebook",
  [GeneralMaterialTypeCodeEnum.AudioBooks]: "audiobook"
};

type Manifestation =
  DashboardBlueRecommendationWorkFragment["manifestations"]["all"][number];

/**
 * Checks whether a manifestation can always be loaned
 *
 * @param manifestation
 *
 * @returns `true` if a manifestation can always be loaned, false otherwise
 */
const isBlueManifestation = (manifestation: Manifestation) => {
  return manifestation.access.some(
    (access) => access.__typename === "Ereol" && access.canAlwaysBeLoaned
  );
};

/**
 * Checks whether a manifestation's material type includes the given `format`
 *
 * @param manifestation
 * @param format
 *
 * @returns Returns `true` if a manifestation includes the given `format`, false otherwise
 */
const hasDigitalFormat = (
  manifestation: Manifestation,
  format: DigitalFormat
) => {
  return manifestation.materialTypes.some(
    (materialType) =>
      formatByMaterialTypeCode[materialType.materialTypeGeneral.code] === format
  );
};

/**
 * Maps a recommended work GraphQL fragment to a RecommendedWork
 * if a blue (cost-free) manifestation can be found for the given `format`
 *
 * @param work The work fragment from GraphQL
 * @param format The format for which a cost free manifestation should exist
 * @param materialUrl The base URL for the material page
 *
 * @returns A RecommendedWork if a cost-free manifestation in `format` exists, undefined otherwise
 */
const toBlueRecommendedWork = (
  work: DashboardBlueRecommendationWorkFragment,
  format: DigitalFormat,
  materialUrl: URL
): RecommendedWork | undefined => {
  const blueManifestation = work.manifestations.all.find(
    (manifestation) =>
      isBlueManifestation(manifestation) &&
      hasDigitalFormat(manifestation, format)
  );

  if (!blueManifestation) {
    return undefined;
  }

  // The material page picks its manifestations by the first material type,
  // so that is the one to link to.
  const materialType =
    blueManifestation.materialTypes.at(0)?.materialTypeSpecific.display;

  return toRecommendedWork(work, materialUrl, materialType);
};

export default useBlueRecommendations;
