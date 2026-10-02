import React, { FC } from "react";
import {
  useGetV1LibraryProfile,
  useGetV1UserLoans
} from "../../../core/publizon/publizon";
import { useText } from "../../../core/utils/text";
import { getPatronLoanQuotas } from "../../../core/utils/helpers/publizon";
import {
  getDigitalLoanQuota,
  useDigitalLoanQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../../core/utils/useBiblioAdapter";
import { QuotaBar } from "./QuotaBar";

const StatusSection: FC = () => {
  const t = useText();
  const viaBiblioAdapter = useBiblioAdapter();

  const { data: libraryProfile } = useGetV1LibraryProfile({
    query: { enabled: !viaBiblioAdapter }
  });
  const { data } = useGetV1UserLoans(
    {},
    { query: { enabled: !viaBiblioAdapter } }
  );
  const { data: digitalLoanQuotas } = useDigitalLoanQuotas({
    enabled: viaBiblioAdapter
  });

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
    hasQuotas
  } = viaBiblioAdapter
    ? {
        patronEbookLoans: digitalEbookQuota.current,
        patronAudioBookLoans: digitalAudioQuota.current,
        maxConcurrentEbookLoansPerBorrower: digitalEbookQuota.limit,
        maxConcurrentAudioLoansPerBorrower: digitalAudioQuota.limit,
        hasQuotas: Boolean(digitalLoanQuotas?.length)
      }
    : {
        patronEbookLoans: publizonQuotas.patronEbookLoans,
        patronAudioBookLoans: publizonQuotas.patronAudioLoans,
        maxConcurrentEbookLoansPerBorrower:
          libraryProfile?.maxConcurrentEbookLoansPerBorrower,
        maxConcurrentAudioLoansPerBorrower:
          libraryProfile?.maxConcurrentAudioLoansPerBorrower,
        hasQuotas: Boolean(libraryProfile)
      };

  return (
    <section className="dpl-status-loans">
      {hasQuotas && (
        <>
          <h2 className="text-header-h4 mt-64 mb-16">
            {t("patronPageStatusSectionHeaderText")}
          </h2>
          <div className="dpl-status-loans__column">
            <div className="dpl-status mt-32">
              <h3 className="text-small-caption">
                {t("patronPageStatusSectionLoanHeaderText")}
              </h3>
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
          </div>
        </>
      )}
    </section>
  );
};

export default StatusSection;
