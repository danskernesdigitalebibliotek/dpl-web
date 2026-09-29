import React, { FC } from "react";
import GuardedApp from "../../components/guarded-app";
import withIsPatronBlockedHoc from "../../core/utils/withIsPatronBlockedHoc";
import { withConfig } from "../../core/utils/config";
import { pageSizeGlobal } from "../../core/utils/helpers/general";
import { withText } from "../../core/utils/text";
import { withUrls } from "../../core/utils/url";
import DashBoard from "./dashboard";
import { BlockedPatronEntryTextProps } from "../../core/storybook/blockedArgs";
import { GroupModalProps } from "../../core/storybook/groupModalArgs";
import { GroupModalLoansProps } from "../../core/storybook/loanGroupModalArgs";
import { ReservationMaterialDetailsProps } from "../../core/storybook/reservationMaterialDetailsArgs";
import { MaterialDetailsModalProps } from "../../core/storybook/materialDetailsModalArgs";
import { GroupModalReservationsProps } from "../../core/storybook/reservationGroupModalArgs";
import { DeleteReservationModalArgs } from "../../core/storybook/deleteReservationModalArgs";
import { RenewalArgs } from "../../core/storybook/renewalArgs";
import { GlobalEntryTextProps } from "../../core/storybook/globalTextArgs";
import { BiblioAdapterArgs } from "../../core/storybook/biblioAdapterArgs";

export interface DashBoardProps {
  // Url
  loansOverdueUrl: string;
  physicalLoansUrl: string;
  feesPageUrl: string;
  reservationsUrl: string;
  userProfileUrl: string;
  // Config
  blacklistedPickupBranchesConfig: string;
  blacklistedAvailabilityBranchesConfig: string;
  branchesConfig: string;
  expirationWarningDaysBeforeConfig: string;
  // Texts
  dashboardNumberInLineText: string;
  dashboardRecommendationsHeadingText: string;
  deleteReservationModalDeleteButtonText: string;
  deleteReservationModalDeleteProcessingText: string;
  deleteReservationModalErrorsStatusText: string;
  deleteReservationModalErrorsTitleText: string;
  deleteReservationModalSuccessStatusText: string;
  deleteReservationModalSuccessTitleText: string;
  etAlText: string;
  feesText: string;
  loanListMaterialDaysText: string;
  loansOverdueText: string;
  loansSoonOverdueText: string;
  materialAndAuthorText: string;
  materialByAuthorText: string;
  noPhysicalLoansText: string;
  noReservationsText: string;
  dashboardSeeMoreFeesText: string;
  dashboardSeeMoreFeesAriaLabelText: string;
  physicalLoansText: string;
  publizonAudioBookText: string;
  publizonEbookText: string;
  publizonPodcastText: string;
  queuedReservationsText: string;
  readyForLoanText: string;
  reservationsReadyText: string;
  reservationsText: string;
  resultPagerStatusText: string;
  statusBadgeWarningText: string;
  totalAmountFeeText: string;
  totalOwedText: string;
  yourProfileText: string;
  dashboardLoansLinkText: string;
  dashboardReservationsLinkText: string;
  dashboardUserProfileLinkText: string;
  reservationListLoanBeforeText: string;
}

const DashboardEntry: FC<
  DashBoardProps &
    BlockedPatronEntryTextProps &
    GroupModalProps &
    GroupModalLoansProps &
    DeleteReservationModalArgs &
    GroupModalReservationsProps &
    RenewalArgs &
    ReservationMaterialDetailsProps &
    MaterialDetailsModalProps &
    GlobalEntryTextProps &
    BiblioAdapterArgs
> = ({ pageSizeDesktop, pageSizeMobile }) => {
  const pageSize = pageSizeGlobal(
    {
      desktop: pageSizeDesktop,
      mobile: pageSizeMobile
    },
    "pageSizeLoanList"
  );

  // GuardedApp replays the favourite request the recommendations persist when
  // the heart is clicked before login. It matches on the app id, so the id
  // here and the one in RecommendedMaterials have to agree.
  return (
    <GuardedApp app="dashboard">
      <DashBoard pageSize={pageSize} />
    </GuardedApp>
  );
};

export default withConfig(
  withUrls(withText(withIsPatronBlockedHoc(DashboardEntry)))
);
