import React, { FC, useState } from "react";
import { sampleSize } from "lodash";
import DashboardFees from "./dashboard-fees/dashboard-fees";
import DashboardNotificationList from "./dashboard-notification-list/dashboard-notification-list";
import { useText, UseTextFunction } from "../../core/utils/text";
import Link from "../../components/atoms/links/Link";
import { useAddFavorite } from "../../components/button-favourite/useAddFavorite";
import MaterialSlider, {
  MaterialSliderCaption,
  MaterialSliderTitle
} from "../../components/material-slider/MaterialSlider";
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
import { RecommendationOrigin, RecommendedWork } from "./recommendations.types";
import useRecommendations from "./useRecommendations";
import useBlueRecommendations, {
  BlueRecommendationSeeds,
  DigitalFormat
} from "./useBlueRecommendations";
import {
  getDigitalLoanQuota,
  useDigitalLoanQuotas,
  useDigitalLoans
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isPatron } from "../../core/utils/helpers/user";

interface DashboardProps {
  pageSize: number;
}

const DashBoard: FC<DashboardProps> = ({ pageSize }) => {
  const t = useText();
  const u = useUrls();

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
        <h1 className="text-header-h1 mt-32 mb-8" data-cy="dashboard-header">
          {t("yourProfileText")}
        </h1>
        <Link
          href={u("userProfileUrl")}
          className="link-tag text-body-medium-regular mb-64"
          dataCy="dashboard-user-profile-link"
        >
          {t("dashboardUserProfileLinkText")}
        </Link>
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
      <BlueRecommendedMaterials />
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
  const t = useText();
  const [seed, ...remainingSeeds] = seeds;

  const recommendationResult = useRecommendations(seed);

  switch (recommendationResult.status) {
    case "loading":
      return null;
    case "found": {
      const { source, recommendations } = recommendationResult.result;
      return (
        <RecommendationsSlider
          caption={getCaptionByOrigin(t, source.origin)}
          title={source.title}
          recommendations={recommendations}
        />
      );
    }
    case "miss":
      return isNonEmpty(remainingSeeds) ? (
        <RecommendationsAttempt seeds={remainingSeeds} />
      ) : null;
    default:
      return invalidSwitchCase(recommendationResult);
  }
};

/**
 * A slider of recommended works under a caption and a title. Shared by the
 * regular and the blue recommendations.
 */
const RecommendationsSlider: FC<{
  caption: string;
  title: string;
  recommendations: RecommendedWork[];
}> = ({ caption, title, recommendations }) => {
  const addToListRequest = useAddFavorite({ app: "dashboard" });

  return (
    <section className="dashboard-page-recommendations">
      <MaterialSlider
        heading={
          <>
            <MaterialSliderCaption>{caption}</MaterialSliderCaption>
            <MaterialSliderTitle>{title}</MaterialSliderTitle>
          </>
        }
        items={recommendations.map((work) => ({
          id: work.workId,
          title: work.title,
          subtitle: work.author,
          url: work.url,
          coverSrc: work.coverSrc
        }))}
        onFavorite={addToListRequest}
      />
    </section>
  );
};

/**
 * Sliders of blue titles, one per format, based on the patron's digital loans
 * only. A patron may borrow physical and digital materials for different
 * reasons, e.g. non-fiction books for themselves and audiobooks for their
 * children.
 */
const BlueRecommendedMaterials: FC = () => {
  const viaBiblioAdapter = useBiblioAdapter();
  const enabled = viaBiblioAdapter && isPatron();
  const { data: loansData } = useDigitalLoans({ enabled });
  const { data: quotas } = useDigitalLoanQuotas({ enabled });

  if (!loansData || !quotas) {
    return null;
  }

  // Blue titles draw on no quota, so they are worth suggesting once the patron
  // holds as many loans in a format as they may at once.
  const hasExceededQuota = (format: DigitalFormat) => {
    const { current, limit } = getDigitalLoanQuota({
      quotas,
      format,
      period: "concurrent"
    });
    return limit !== undefined && current >= limit;
  };

  const isbnsByFormat = (format: DigitalFormat) =>
    loansData.loans
      .filter(({ materialType }) => materialType === format)
      .map(({ materialId }) => materialId);

  return (
    <>
      {hasExceededQuota("ebook") && (
        <BlueRecommendationsForFormat
          format="ebook"
          isbns={isbnsByFormat("ebook")}
        />
      )}
      {hasExceededQuota("audiobook") && (
        <BlueRecommendationsForFormat
          format="audiobook"
          isbns={isbnsByFormat("audiobook")}
        />
      )}
    </>
  );
};

/**
 * Picks three of the patron's loans in a format at random to base the blue
 * recommendations on. With fewer than three there is nothing to show.
 */
const BlueRecommendationsForFormat: FC<{
  format: DigitalFormat;
  isbns: string[];
}> = ({ format, isbns }) => {
  // Kept in state so rerenders do not pick other seeds.
  const [seeds] = useState(() => {
    const [first, second, third] = sampleSize(isbns, 3).map(
      (isbn): RecommendationSeed => ({ type: "isbn", isbn, origin: "loan" })
    );
    return first && second && third
      ? ([first, second, third] satisfies BlueRecommendationSeeds)
      : null;
  });

  return seeds ? <BlueRecommendations seeds={seeds} format={format} /> : null;
};

const BlueRecommendations: FC<{
  seeds: BlueRecommendationSeeds;
  format: DigitalFormat;
}> = ({ seeds, format }) => {
  const t = useText();
  const recommendations = useBlueRecommendations(seeds, format);
  const { caption, title } = getBlueRecommendationsHeading(t, format);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <RecommendationsSlider
      caption={caption}
      title={title}
      recommendations={recommendations}
    />
  );
};

const getBlueRecommendationsHeading = (
  t: UseTextFunction,
  format: DigitalFormat
) => {
  switch (format) {
    case "ebook":
      return {
        caption: t("dashboardBlueRecommendationsEbookCaptionText"),
        title: t("dashboardBlueRecommendationsEbookTitleText")
      };
    case "audiobook":
      return {
        caption: t("dashboardBlueRecommendationsAudiobookCaptionText"),
        title: t("dashboardBlueRecommendationsAudiobookTitleText")
      };
    default:
      return invalidSwitchCase<{ caption: string; title: string }>(format);
  }
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
      return invalidSwitchCase<string>(origin);
  }
};

export default DashBoard;
