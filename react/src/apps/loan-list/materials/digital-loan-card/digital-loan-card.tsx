import React, { FC } from "react";
import fetchMaterial, { MaterialProps } from "../utils/material-fetch-hoc";
import fetchDigitalMaterial from "../utils/digital-material-fetch-hoc";
import ListMaterialSkeleton from "../../../reservation-list/reservation-material/list-material-skeleton";
import { LoanType } from "../../../../core/utils/types/loan-type";
import { LoanId } from "../../../../core/utils/types/ids";
import StatusCircle from "../utils/status-circle";
import StatusBadge from "../utils/status-badge";
import LinkButton from "../../../../components/Buttons/LinkButton";
import { Button } from "../../../../components/Buttons/Button";
import { Cover } from "../../../../components/cover/cover";
import AuthorYear from "../../../../components/author-year/authorYear";
import { useText } from "../../../../core/utils/text";
import { formatDateTimeUtc } from "../../../../core/utils/helpers/date";
import { getReaderPlayerTypeFromPublizonProductType } from "../../../../components/reader-player/helper";
import { useEventStatistics } from "../../../../core/statistics/useStatistics";
import { statistics } from "../../../../core/statistics/statistics";

export interface DigitalLoanCardProps {
  loan: LoanType;
  openLoanDetailsModal: (loan: LoanType) => void;
  onPlayDigital: (orderId: string) => void;
  loanId?: LoanId | null;
}

const DigitalLoanCard: FC<DigitalLoanCardProps & MaterialProps> = ({
  loan,
  material,
  openLoanDetailsModal,
  onPlayDigital,
  loanId
}) => {
  const { dueDate, loanDate, identifier, periodical, orderId } = loan;
  const t = useText();
  const { track } = useEventStatistics();

  const readerPlayerType = getReaderPlayerTypeFromPublizonProductType(
    material?.digitalProductType
  );
  const titleId = `${loanId || identifier}-title`;
  const openDetails = () => openLoanDetailsModal(loan);
  const {
    authorsShort,
    materialType,
    year,
    title,
    description,
    pid,
    series,
    lang
  } = material || {};
  const coverId = pid || identifier || "";

  const renderPrimaryAction = () => {
    if (!orderId || !readerPlayerType) return null;
    if (readerPlayerType === "reader") {
      return (
        <LinkButton
          url={
            new URL(
              `/reader?orderid=${encodeURIComponent(orderId)}`,
              window.location.href
            )
          }
          buttonType="none"
          variant="filled"
          size="small"
          dataCy="loan-list-reader-button"
          trackClick={() =>
            track("click", {
              id: statistics.publizonReadListen.id,
              name: statistics.publizonReadListen.name,
              trackedData: orderId
            })
          }
        >
          {t("onlineMaterialReaderText", {
            placeholders: { "@materialType": material?.materialType || "" }
          })}
        </LinkButton>
      );
    }
    return (
      <Button
        dataCy="loan-list-player-button"
        label={t("onlineMaterialPlayerText", {
          placeholders: { "@materialType": material?.materialType || "" }
        })}
        buttonType="none"
        variant="filled"
        size="small"
        collapsible={false}
        onClick={() => {
          track("click", {
            id: statistics.publizonReadListen.id,
            name: statistics.publizonReadListen.name,
            trackedData: orderId
          });
          onPlayDigital(orderId);
        }}
      />
    );
  };

  if (!material) return null;

  return (
    <div className="list-reservation list-reservation--no-hover my-32">
      <div className="list-reservation__material">
        <Cover
          ids={[coverId]}
          idType={pid ? "pid" : "isbn"}
          size="small"
          animate={false}
          alt={description || ""}
        />
        <div className="list-reservation__information list-reservation__information--centered-about">
          <div>
            {materialType && (
              <div className="status-label status-label--outline">
                {materialType}
              </div>
            )}
          </div>
          <div className="list-reservation__about">
            <h3
              lang={lang || ""}
              className="list-reservation__title color-secondary-gray"
            >
              <span id={titleId} className="list-reservation__title__text">
                {title}
              </span>
            </h3>
            <p className="text-small-caption color-secondary-gray">
              <AuthorYear author={authorsShort || ""} year={year || ""} />
            </p>
            {periodical && (
              <p className="text-small-caption color-secondary-gray">
                {periodical}
              </p>
            )}
            {series && (
              <p className="text-small-caption color-secondary-gray">
                {series}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="list-reservation__status">
        {loanDate && dueDate && (
          <div className="list-reservation__counter">
            <StatusCircle loanDate={loanDate} dueDate={dueDate} />
          </div>
        )}
        <div className="list-reservation__deadline">
          {dueDate && (
            <StatusBadge
              showBadgeWithDueDate
              badgeDate={dueDate}
              dangerText={t("loanListStatusBadgeDangerText")}
              warningText={t("loanListStatusBadgeWarningText")}
            />
          )}
          {dueDate && (
            <p className="text-small-caption color-secondary-gray">
              {t("loanListToBeDeliveredDigitalMaterialText", {
                placeholders: { "@date": formatDateTimeUtc(dueDate) }
              })}
            </p>
          )}
        </div>
        <div className="list-reservation__actions">
          {renderPrimaryAction()}
          <button
            type="button"
            data-cy="loan-list-loan-details-button"
            onClick={openDetails}
            className="link-tag text-small-caption"
          >
            {t("loanListLoanDetailsText")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default fetchDigitalMaterial(
  fetchMaterial(DigitalLoanCard, ListMaterialSkeleton),
  ListMaterialSkeleton
);
