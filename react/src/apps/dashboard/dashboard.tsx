import React, { FC, useState } from "react";
import DashboardFees from "./dashboard-fees/dashboard-fees";
import DashboardNotificationList from "./dashboard-notification-list/dashboard-notification-list";
import { useText } from "../../core/utils/text";
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

  // The lists arrive from separate services at different speeds. The
  // recommendations order their seeds once, on mount, so they are only
  // mounted once every list has settled - otherwise a reservation could be
  // tried before a loan that simply had not arrived yet. A failed request is
  // not loading and has no data, so it counts as an empty list.
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

// The caption above the recommendations title, phrased after where the
// material the recommendations are based on came from.
const captionTextKeyByOrigin: Record<RecommendationOrigin, string> = {
  loan: "dashboardRecommendationsLoanCaptionText",
  reservation: "dashboardRecommendationsReservationCaptionText",
  favorite: "dashboardRecommendationsFavoriteCaptionText"
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
  // The order is drawn once: a re-render must not reshuffle the seeds under
  // the attempts below.
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
 * Tries one seed. A hit renders the slider. A miss renders the attempt for the
 * next seed as a child, so every seed gets its own hook call and no state or
 * effect has to step between them. The depth is bounded by the number of
 * seeds.
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
              {t(captionTextKeyByOrigin[result.source.origin])}
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

export default DashBoard;
