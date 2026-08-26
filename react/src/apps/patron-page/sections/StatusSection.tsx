import React, { useEffect, useState, FC } from "react";
import {
  useGetV1LibraryProfile,
  useGetV1UserLoans
} from "../../../core/publizon/publizon";
import { LibraryProfile, UserData } from "../../../core/publizon/model";
import { useText } from "../../../core/utils/text";
import { getPatronLoanQuotas } from "../../../core/utils/helpers/publizon";
import {
  getLoanQuota,
  useDigitalLoanQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useServiceLayerLending from "../../../core/utils/useServiceLayerLending";

const StatusSection: FC = () => {
  const t = useText();
  const viaServiceLayer = useServiceLayerLending();

  const { data: libraryProfileFetched } = useGetV1LibraryProfile({
    query: { enabled: !viaServiceLayer }
  });
  const { isSuccess, data } = useGetV1UserLoans(
    {},
    { query: { enabled: !viaServiceLayer } }
  );
  const { data: digitalQuotas } = useDigitalLoanQuotas({
    enabled: viaServiceLayer
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
  // counters are the Biblio equivalent of Publizon's maxConcurrent limits.
  const digitalEbookQuota = getLoanQuota({
    quotas: digitalQuotas,
    format: "ebook",
    period: "concurrent"
  });
  const digitalAudioQuota = getLoanQuota({
    quotas: digitalQuotas,
    format: "audiobook",
    period: "concurrent"
  });

  const patronEbookLoans = viaServiceLayer
    ? digitalEbookQuota.current
    : publizonQuotas.patronEbookLoans;
  const patronAudioBookLoans = viaServiceLayer
    ? digitalAudioQuota.current
    : publizonQuotas.patronAudioLoans;
  const maxConcurrentEbookLoansPerBorrower = viaServiceLayer
    ? digitalEbookQuota.limit
    : libraryProfile?.maxConcurrentEbookLoansPerBorrower;
  const maxConcurrentAudioLoansPerBorrower = viaServiceLayer
    ? digitalAudioQuota.limit
    : libraryProfile?.maxConcurrentAudioLoansPerBorrower;

  // Publizon gates the whole section on its library profile. Biblio has no
  // equivalent document, so its quotas take that role.
  // An empty array is an answer, not a quota: rendering the section from it
  // would show a heading with two blank counters.
  const hasQuotas = viaServiceLayer
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
          {/* Biblio's quotas cover loans only - it has no reservation limits
              to show, so the line is left out rather than rendered as zero. */}
          {!viaServiceLayer && (
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
