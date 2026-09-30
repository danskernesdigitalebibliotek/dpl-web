import React, { FC, useState } from "react";
import DashboardFees from "./dashboard-fees/dashboard-fees";
import DashboardNotificationList from "./dashboard-notification-list/dashboard-notification-list";
import { useText, UseTextFunction } from "../../core/utils/text";
import { useAddFavorite } from "../../components/button-favourite/useAddFavorite";
import MaterialSlider, {
  MaterialSliderCaption,
  MaterialSliderTitle
} from "../../components/material-slider/MaterialSlider";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import invalidSwitchCase from "../../core/utils/helpers/invalid-switch-case";
import {
  NonEmptyArray,
  isNonEmpty
} from "../../core/utils/helpers/non-empty-array";
import { useUrls } from "../../core/utils/url";
import useLoans from "../../core/utils/useLoans";
import useReservations from "../../core/utils/useReservations";
import { useGetList } from "../../core/material-list-api/material-list";
import { WorkId } from "../../core/utils/types/ids";
import { LoanType } from "../../core/utils/types/loan-type";
import { ReservationType } from "../../core/utils/types/reservation-type";
import {
  RecommendationSeed,
  listItemsToRecommendationSeeds,
  orderRecommendationSeeds,
  workIdsToRecommendationSeeds
} from "./recommendationSeed";
import {
  RecommendationOrigin,
  RecommendationResult
} from "./recommendations.types";
import useRecommendations from "./useRecommendations";

interface DashboardProps {
  pageSize: number;
}

const DashBoard: FC<DashboardProps> = ({ pageSize }) => {
  const t = useText();

  const loans = useLoans();
  const reservations = useReservations();
  const { data: favoritesList, isLoading: isLoadingFavorites } =
    useGetList("default");

  // We must wait for all lists to settle before rendering recommendations,
  // as we need to prioritize: loans -> reservations -> favorites.
  const hasSettledLists =
    !loans.all.isLoading && !reservations.all.isLoading && !isLoadingFavorites;

  return (
    <>
      <div className="dashboard-page">
        <h1 className="text-header-h1 mt-32 mb-64" data-cy="dashboard-header">
          {t("yourProfileText")}
        </h1>
        <DashboardFees />
        <DashboardNotificationList
          columns
          pageSize={pageSize}
          loans={loans}
          reservations={reservations}
        />
      </div>
      {hasSettledLists && (
        <RecommendedMaterials
          loans={loans.all.loans}
          reservations={reservations.all.reservations}
          favorites={(favoritesList?.collections ?? []) as WorkId[]}
        />
      )}
    </>
  );
};

// How many seeds to try before giving up on the section.
const MAX_ATTEMPTS = 5;

type RecommendedMaterialsProps = {
  loans: LoanType[];
  reservations: ReservationType[];
  favorites: WorkId[];
};

const RecommendedMaterials: FC<RecommendedMaterialsProps> = ({
  loans,
  reservations,
  favorites
}) => {
  // The state variable is used to keep the seeds stable across renders.
  // Internally, the `orderRecommendationSeeds` shuffles the seeds, so
  // without this rerenders would reorder the seeds.
  const [seeds] = useState(() =>
    orderRecommendationSeeds({
      loans: listItemsToRecommendationSeeds(loans, "loan"),
      reservations: listItemsToRecommendationSeeds(reservations, "reservation"),
      favorites: workIdsToRecommendationSeeds(favorites)
    }).slice(0, MAX_ATTEMPTS)
  );

  return isNonEmpty(seeds) ? <RecommendationsAttempt seeds={seeds} /> : null;
};

/**
 * Attempts to fetch recommendations based on the first seed in `seeds`
 *
 * If successful, it renders the recommendations as a slider.
 * If not, it renders another RecommendationsAttempt component
 * which retries with the next seed from the list.
 */
const RecommendationsAttempt: FC<{
  seeds: NonEmptyArray<RecommendationSeed>;
}> = ({ seeds }) => {
  const [seed, ...remainingSeeds] = seeds;

  const recommendationResult = useRecommendations(seed);

  switch (recommendationResult.status) {
    case "loading":
      return null;
    case "found":
      return <RecommendationsSlider result={recommendationResult.result} />;
    case "miss":
      return isNonEmpty(remainingSeeds) ? (
        <RecommendationsAttempt seeds={remainingSeeds} />
      ) : null;
    default:
      return invalidSwitchCase(recommendationResult);
  }
};

const RecommendationsSlider: FC<{ result: RecommendationResult }> = ({
  result
}) => {
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToListRequest = useAddFavorite({ app: "dashboard" });

  return (
    <section className="dashboard-page-recommendations">
      <MaterialSlider
        heading={
          <>
            <MaterialSliderCaption>
              {getCaptionByOrigin(t, result.source.origin)}
            </MaterialSliderCaption>
            <MaterialSliderTitle>{result.source.title}</MaterialSliderTitle>
          </>
        }
        items={result.recommendations.map((work) => ({
          id: work.workId,
          title: work.title,
          subtitle: work.author,
          url: constructMaterialUrl(materialUrl, work.workId),
          coverSrc: work.coverSrc
        }))}
        onFavorite={addToListRequest}
      />
    </section>
  );
};

const getCaptionByOrigin = (
  t: UseTextFunction,
  origin: RecommendationOrigin
) => {
  switch (origin) {
    case "loan":
      return t("dashboardRecommendationsLoanCaptionText");
    case "reservation":
      return t("dashboardRecommendationsReservationCaptionText");
    case "favorite":
      return t("dashboardRecommendationsFavoriteCaptionText");
    default:
      invalidSwitchCase(origin);
  }
};

export default DashBoard;
