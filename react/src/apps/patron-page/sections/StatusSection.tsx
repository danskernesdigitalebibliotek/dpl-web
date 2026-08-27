import React, { useEffect, useState, FC } from "react";
import {
  useGetV1LibraryProfile,
  useGetV1UserLoans
} from "../../../core/publizon/publizon";
import { LibraryProfile, UserData } from "../../../core/publizon/model";
import { useText } from "../../../core/utils/text";
import { getPatronLoanQuotas } from "../../../core/utils/helpers/publizon";
import {
  getDigitalLoanQuota,
  useDigitalLoanQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../../core/utils/useBiblioAdapter";

const StatusSection: FC = () => {
  const t = useText();
  const viaBiblioAdapter = useBiblioAdapter();

  const { data: libraryProfileFetched } = useGetV1LibraryProfile({
    query: { enabled: !viaBiblioAdapter }
  });
  const { isSuccess, data } = useGetV1UserLoans(
    {},
    { query: { enabled: !viaBiblioAdapter } }
  );
  const { data: digitalQuotas } = useDigitalLoanQuotas({
    enabled: viaBiblioAdapter
  });
  const [libraryProfile, setLibraryProfile] = useState<LibraryProfile | null>(
    null
  );
  const [patronData, setPatronData] = useState<UserData | null>(null);

  useEffect(() => {
    if (isSuccess && data && data.userData) {
      setPatronData(data.userData);
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (libraryProfileFetched) {
      setLibraryProfile(libraryProfileFetched);
    }
  }, [libraryProfileFetched]);

  const {
    maxConcurrentAudioReservationsPerBorrower = 0,
    maxConcurrentEbookReservationsPerBorrower = 0
  } = libraryProfile || {};

  const publizonQuotas = getPatronLoanQuotas({
    userData: patronData ?? undefined,
    loans: data?.loans
  });

  // This section counts the loans the user holds right now, so the concurrent
  // counters are the service layer equivalent of Publizon's maxConcurrent
  // limits.
  const digitalEbookQuota = getDigitalLoanQuota({
    quotas: digitalQuotas,
    format: "ebook",
    period: "concurrent"
  });
  const digitalAudioQuota = getDigitalLoanQuota({
    quotas: digitalQuotas,
    format: "audiobook",
    period: "concurrent"
  });

  const patronEbookLoans = viaBiblioAdapter
    ? digitalEbookQuota.current
    : publizonQuotas.patronEbookLoans;
  const patronAudioBookLoans = viaBiblioAdapter
    ? digitalAudioQuota.current
    : publizonQuotas.patronAudioLoans;
  const maxConcurrentEbookLoansPerBorrower = viaBiblioAdapter
    ? digitalEbookQuota.limit
    : libraryProfile?.maxConcurrentEbookLoansPerBorrower;
  const maxConcurrentAudioLoansPerBorrower = viaBiblioAdapter
    ? digitalAudioQuota.limit
    : libraryProfile?.maxConcurrentAudioLoansPerBorrower;

  // Publizon gates the whole section on its library profile. The service
  // layer has no
  // equivalent document, so its quotas take that role.
  // An empty array is an answer, not a quota: rendering the section from it
  // would show a heading with two blank counters.
  const hasQuotas = viaBiblioAdapter
    ? Boolean(digitalQuotas?.length)
    : Boolean(libraryProfile);

  // Publizon doesn't account for "subscription" (aka, "blue", aka
  // "non-quota") loans, so we have to figure out how many of the
  // loans are outside quota and subtract them. This will move to the
  // service layer when that's implemented.
  let eBookLoanPercent = 100;
  if (maxConcurrentEbookLoansPerBorrower) {
    eBookLoanPercent =
      (patronEbookLoans / maxConcurrentEbookLoansPerBorrower) * 100;
  }

  let audioBookLoanPercent = 100;
  if (maxConcurrentAudioLoansPerBorrower) {
    audioBookLoanPercent =
      (patronAudioBookLoans / maxConcurrentAudioLoansPerBorrower) * 100;
  }

  return (
    <section className="dpl-status-loans">
      {hasQuotas && (
        <>
          <h2 className="text-header-h4 mt-64 mb-16">
            {t("patronPageStatusSectionHeaderText")}
          </h2>
          <div className="text-body-small-regular mb-8">
            {t("patronPageStatusSectionBodyText")}
          </div>
          {/* The service layer's quotas cover loans only - there are no reservation limits
              to show, so the line is left out rather than rendered as zero. */}
          {!viaBiblioAdapter && (
            <div className="text-body-small-regular mt-8 mb-8">
              {t("patronPageStatusSectionReservationsText", {
                placeholders: {
                  "@countEbooks": maxConcurrentEbookReservationsPerBorrower,
                  "@countAudiobooks": maxConcurrentAudioReservationsPerBorrower
                }
              })}
            </div>
          )}
          <div className="dpl-status-loans__column">
            <div className="dpl-status mt-32">
              <h3 className="text-small-caption">
                {t("patronPageStatusSectionLoanHeaderText")}
              </h3>
              <div className="dpl-progress-bar text-small-caption color-secondary-gray">
                <div className="dpl-progress-bar__header">
                  <label
                    className="text-label text-body-medium-medium"
                    htmlFor="patron-page-status-section-out-of-text"
                  >
                    {t("patronPageStatusSectionLoansEbooksText")}
                  </label>
                  {maxConcurrentEbookLoansPerBorrower !== undefined && (
                    <div
                      className="text-label"
                      id="patron-page-status-section-out-of-text"
                    >
                      {t("patronPageStatusSectionOutOfText", {
                        placeholders: {
                          "@this": patronEbookLoans,
                          "@that": maxConcurrentEbookLoansPerBorrower
                        }
                      })}
                    </div>
                  )}
                </div>
                <div className="dpl-progress-bar__progress-bar bg-global-secondary">
                  {maxConcurrentEbookLoansPerBorrower !== undefined && (
                    <div
                      className="bg-identity-primary"
                      role="figure"
                      aria-label={t(
                        "patronPageStatusSectionOutOfAriaLabelEbooksText",
                        {
                          placeholders: {
                            "@this": patronEbookLoans,
                            "@that": maxConcurrentEbookLoansPerBorrower
                          }
                        }
                      )}
                      style={{ width: `${eBookLoanPercent}%` }}
                    />
                  )}
                </div>
              </div>
              <div className="dpl-progress-bar text-small-caption color-secondary-gray">
                <div className="dpl-progress-bar__header">
                  <label
                    className="text-label"
                    htmlFor="max-concurrent-audio-loans-per-borrower"
                  >
                    {t("patronPageStatusSectionLoansAudioBooksText")}
                  </label>
                  {maxConcurrentAudioLoansPerBorrower !== undefined && (
                    <div
                      className="text-label"
                      id="max-concurrent-audio-loans-per-borrower"
                    >
                      {t("patronPageStatusSectionOutOfText", {
                        placeholders: {
                          "@this": patronAudioBookLoans,
                          "@that": maxConcurrentAudioLoansPerBorrower
                        }
                      })}
                    </div>
                  )}
                </div>
                <div className="dpl-progress-bar__progress-bar bg-global-secondary">
                  {maxConcurrentAudioLoansPerBorrower !== undefined && (
                    <div
                      role="figure"
                      aria-label={t(
                        "patronPageStatusSectionOutOfAriaLabelAudioBooksText",
                        {
                          placeholders: {
                            "@this": patronAudioBookLoans,
                            "@that": maxConcurrentAudioLoansPerBorrower
                          }
                        }
                      )}
                      className="bg-identity-primary"
                      style={{ width: `${audioBookLoanPercent}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default StatusSection;
