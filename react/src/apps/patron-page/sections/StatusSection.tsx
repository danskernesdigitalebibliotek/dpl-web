import React, { FC } from "react";
import {
  useGetV1LibraryProfile,
  useGetV1UserLoans
} from "../../../core/publizon/publizon";
import { useText } from "../../../core/utils/text";
import { getPatronLoanQuotas } from "../../../core/utils/helpers/publizon";
import {
  getDigitalLoanQuota,
  useDigitalQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../../core/utils/useBiblioAdapter";
import { useUrls } from "../../../core/utils/url";
import { constructAdvancedSearchUrl } from "../../../core/advanced-search/url";
import {
  MATERIAL_TYPE_AUDIOBOOKS,
  MATERIAL_TYPE_EBOOKS
} from "../../../core/advanced-search/material-types";
import Link from "../../../components/atoms/links/Link";
import { QuotaBar } from "./QuotaBar";
import { ComplexSearchFacetsEnum } from "../../../core/dbc-gateway/generated/graphql";
import { SortOption } from "../../../core/advanced-search/types";

const StatusSection: FC = () => {
  const t = useText();
  const u = useUrls();
  const viaBiblioAdapter = useBiblioAdapter();

  const alwaysLoanableDigitalTitlesUrl = constructAdvancedSearchUrl({
    advancedSearchUrl: u("advancedSearchUrl"),
    preSearchFacets: [
      {
        facetField: ComplexSearchFacetsEnum.Generalmaterialtype,
        selectedValues: [MATERIAL_TYPE_EBOOKS, MATERIAL_TYPE_AUDIOBOOKS]
      }
    ],
    onlyExtraTitles: true,
    sort: SortOption.LatestPubDateDesc,
    view: "results"
  });

  const { data: libraryProfile } = useGetV1LibraryProfile({
    query: { enabled: !viaBiblioAdapter }
  });
  const { data } = useGetV1UserLoans(
    {},
    { query: { enabled: !viaBiblioAdapter } }
  );
  const {
    loanQuotas: { data: digitalLoanQuotas },
    reservationLimits: { data: digitalReservationLimits }
  } = useDigitalQuotas({ enabled: viaBiblioAdapter });

  // Publizon doesn't account for "subscription" (aka, "blue", aka
  // "non-quota") loans, so we have to figure out how many of the
  // loans are outside quota and subtract them. This will move to the
  // service layer when that's implemented.
  const publizonQuotas = getPatronLoanQuotas({
    userData: data?.userData,
    loans: data?.loans
  });

  // This section counts the loans the user holds right now, so the concurrent
  // counters are the service layer equivalent of Publizon's maxConcurrent
  // limits.
  const digitalEbookQuota = getDigitalLoanQuota({
    quotas: digitalLoanQuotas,
    format: "ebook",
    period: "concurrent"
  });
  const digitalAudioQuota = getDigitalLoanQuota({
    quotas: digitalLoanQuotas,
    format: "audiobook",
    period: "concurrent"
  });

  // Publizon gates the section on its library profile; the service layer has
  // no equivalent document, so its quotas take that role. An empty array is
  // an answer, not a quota - rendering from it would show two blank counters.
  const {
    patronEbookLoans,
    patronAudioBookLoans,
    maxConcurrentEbookLoansPerBorrower,
    maxConcurrentAudioLoansPerBorrower,
    reservationCeilings,
    hasQuotas
  } = viaBiblioAdapter
    ? {
        patronEbookLoans: digitalEbookQuota.current,
        patronAudioBookLoans: digitalAudioQuota.current,
        maxConcurrentEbookLoansPerBorrower: digitalEbookQuota.limit,
        maxConcurrentAudioLoansPerBorrower: digitalAudioQuota.limit,
        reservationCeilings: digitalReservationLimits, // { ebook, audiobook } or null.
        hasQuotas: Boolean(digitalLoanQuotas?.length)
      }
    : {
        patronEbookLoans: publizonQuotas.patronEbookLoans,
        patronAudioBookLoans: publizonQuotas.patronAudioLoans,
        maxConcurrentEbookLoansPerBorrower:
          libraryProfile?.maxConcurrentEbookLoansPerBorrower,
        maxConcurrentAudioLoansPerBorrower:
          libraryProfile?.maxConcurrentAudioLoansPerBorrower,
        reservationCeilings: {
          ebook: libraryProfile?.maxConcurrentEbookReservationsPerBorrower ?? 0,
          audiobook:
            libraryProfile?.maxConcurrentAudioReservationsPerBorrower ?? 0
        },
        hasQuotas: Boolean(libraryProfile)
      };

  return (
    <section className="dpl-status-loans">
      {hasQuotas && (
        <>
          <h2 className="text-header-h4 mt-64 mb-16">
            {t("patronPageStatusSectionHeaderText")}
          </h2>
          {reservationCeilings && (
            <p className="text-body-small-regular dpl-status-loans__reservations">
              {t("patronPageStatusSectionReservationsText", {
                placeholders: {
                  "@countEbooks": reservationCeilings.ebook,
                  "@countAudiobooks": reservationCeilings.audiobook
                }
              })}
            </p>
          )}
          <Link
            href={alwaysLoanableDigitalTitlesUrl}
            className="link-tag text-body-small-regular"
            dataCy="patron-page-always-loanable-link"
          >
            {t("patronPageStatusSectionLinkText")}
          </Link>
          <div className="dpl-status-loans__progress-bars">
            <QuotaBar
              id="patron-page-status-section-out-of-text"
              labelTextKey="patronPageStatusSectionLoansEbooksText"
              ariaLabelTextKey="patronPageStatusSectionOutOfAriaLabelEbooksText"
              current={patronEbookLoans}
              limit={maxConcurrentEbookLoansPerBorrower}
            />
            <QuotaBar
              id="max-concurrent-audio-loans-per-borrower"
              labelTextKey="patronPageStatusSectionLoansAudioBooksText"
              ariaLabelTextKey="patronPageStatusSectionOutOfAriaLabelAudioBooksText"
              current={patronAudioBookLoans}
              limit={maxConcurrentAudioLoansPerBorrower}
            />
          </div>
        </>
      )}
    </section>
  );
};

export default StatusSection;
