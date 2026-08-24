import React from "react";
import GuardedApp from "../../components/guarded-app";
import { GlobalConfigProps } from "../../core/storybook/globalConfigArgs";
import { GlobalEntryTextProps } from "../../core/storybook/globalTextArgs";
import { MappArgs } from "../../core/storybook/mappArgs";
import { withConfig } from "../../core/utils/config";
import { withText } from "../../core/utils/text";
import { withUrls } from "../../core/utils/url";
import Series from "./Series";

interface SeriesEntryOwnProps {
  seriesId: string;
}

interface SeriesEntryTextProps {
  seriesReadThisFirstText: string;
  seriesByAuthorText: string;
  // Global CMS texts, but not part of GlobalEntryTextProps, so they have to be
  // declared per app - as the other apps using them do.
  byAuthorText: string;
  etAlText: string;
  resultPagerStatusText: string;
  showMoreText: string;
}

// materialUrl is supplied to every app by dpl_react_apps.module as a global
// url, so DplReactAppsController::series() does not declare it. Storybook has
// no such global, which is why the stories set it explicitly.
interface SeriesEntryUrlProps {
  materialUrl: string;
  searchUrl: string;
}

// The availability labels on each card reach useGetAvailability, which excludes
// blacklisted branches from the FBS lookup. Unlike the texts these configs are
// declared per controller method rather than globally, so the series page has
// to ask for them. MappArgs covers the two the statistics hook reads.
interface SeriesEntryConfigProps {
  blacklistedAvailabilityBranchesConfig: string;
}

export interface SeriesEntryProps
  extends
    GlobalEntryTextProps,
    GlobalConfigProps,
    MappArgs,
    SeriesEntryOwnProps,
    SeriesEntryTextProps,
    SeriesEntryUrlProps,
    SeriesEntryConfigProps {}

// GuardedApp replays the favourite request the cards persist when an anonymous
// user clicks the heart and then logs in. It matches on the app id, so the id
// here and the one in Series.tsx have to agree.
const SeriesEntry: React.FC<SeriesEntryProps> = ({ seriesId }) => (
  <GuardedApp app="series">
    <Series seriesId={seriesId} />
  </GuardedApp>
);

export default withConfig(withUrls(withText(SeriesEntry)));
