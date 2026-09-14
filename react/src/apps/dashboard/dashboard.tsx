import React, { FC, useState } from "react";
import DashboardFees from "./dashboard-fees/dashboard-fees";
import DashboardNotificationList from "./dashboard-notification-list/dashboard-notification-list";
import { useText } from "../../core/utils/text";
import { useAddFavorite } from "../../components/button-favourite/useAddFavorite";
import MaterialSlider from "../../components/material-slider/MaterialSlider";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import { useUrls } from "../../core/utils/url";
import useLoans from "../../core/utils/useLoans";
import useReservations from "../../core/utils/useReservations";
import { useGetList } from "../../core/material-list-api/material-list";
import { WorkId } from "../../core/utils/types/ids";
import { LoanType } from "../../core/utils/types/loan-type";
import { ReservationType } from "../../core/utils/types/reservation-type";
import { hasValue } from "../../core/utils/helpers/has-value";
import {
  listItemToRecommendationSource,
  pickRecommendationSource,
  workIdToRecommendationSource
} from "./recommendationSource";
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
  // recommendations pick their source on mount, so they are only mounted once
  // every list has settled - otherwise a reservation could win over a loan
  // that simply had not arrived yet. A failed request is not loading and has
  // no data, so it counts as an empty list.
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
  const t = useText();
  const u = useUrls();
  const materialUrl = u("materialUrl");
  const addToListRequest = useAddFavorite({ app: "dashboard" });

  // Picked once on mount and kept for the lifetime of the component so the
  // recommendations do not reshuffle on re-render.
  const [source] = useState(() => {
    const loanSources = loans
      .map(listItemToRecommendationSource)
      .filter(hasValue);

    const reservationSources = reservations
      .map(listItemToRecommendationSource)
      .filter(hasValue);

    const favoriteSources = favorites.map(workIdToRecommendationSource);

    return pickRecommendationSource({
      loans: loanSources,
      reservations: reservationSources,
      favorites: favoriteSources
    });
  });

  const { works, isLoading } = useRecommendations(source);

  // The section is decorative, so it simply appears once loaded rather than
  // holding a placeholder open. No results is the designed outcome, not an
  // error state.
  if (isLoading || works.length === 0) {
    return null;
  }

  return (
    <section className="related-works">
      <MaterialSlider
        heading={t("dashboardRecommendationsHeadingText")}
        items={works.map((work) => ({
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
