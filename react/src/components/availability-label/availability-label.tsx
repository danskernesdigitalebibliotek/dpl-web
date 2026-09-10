import React, { memo } from "react";
import { useDeepCompareEffect } from "react-use";
import { useText } from "../../core/utils/text";
import LinkNoStyle from "../atoms/links/LinkNoStyle";
import { useCollectPageStatistics } from "../../core/statistics/useStatistics";
import { statistics } from "../../core/statistics/statistics";
import { getParentAvailabilityLabelClass } from "./helper";
import AvailabilityLabelInside from "./availability-label-inside";
import useAvailabilityData from "./useAvailabilityData";
import { AccessTypeCodeEnum } from "../../core/dbc-gateway/generated/graphql";
import { DigitalMaterialId, FaustId } from "../../core/utils/types/ids";

export interface AvailabilityLabelProps {
  manifestText: string;
  accessTypes: AccessTypeCodeEnum[];
  selected?: boolean;
  url?: URL;
  faustIds: FaustId[];
  handleSelectManifestation?: () => void | undefined;
  cursorPointer?: boolean;
  dataCy?: string;
  // The same identifier the loan buttons use, so both ask about the same
  // edition and share one request.
  identifier: DigitalMaterialId | null;
  isVisualOnly?: boolean;
}

export const AvailabilityLabel: React.FC<AvailabilityLabelProps> = ({
  manifestText,
  accessTypes,
  selected = false,
  url,
  faustIds,
  handleSelectManifestation,
  cursorPointer = false,
  dataCy = "availability-label",
  identifier,
  isVisualOnly
}) => {
  const { collectPageStatistics } = useCollectPageStatistics();
  const t = useText();

  const { isLoading, isAvailable } = useAvailabilityData({
    accessTypes,
    faustIds,
    identifier,
    manifestText
  });

  const availabilityText = isAvailable
    ? t("availabilityAvailableText")
    : t("availabilityUnavailableText");

  useDeepCompareEffect(() => {
    // Track material availability (status) if the button is active - also meaning
    // it is displayed on the material page and represent the active manifestation
    // material type
    if (selected && !isLoading) {
      collectPageStatistics({
        ...statistics.materialStatus,
        trackedData: availabilityText
      });
    }
  }, [availabilityText, collectPageStatistics, faustIds, isLoading, selected]);

  const availabilityLabel = (
    <AvailabilityLabelInside
      selected={selected}
      isLoading={!!isLoading}
      isAvailable={!!isAvailable}
      manifestText={manifestText}
      availabilityText={availabilityText}
    />
  );

  const parentClass = getParentAvailabilityLabelClass({
    selected,
    cursorPointer
  });

  if (isVisualOnly) {
    return (
      <div className={parentClass} data-cy={dataCy}>
        {availabilityLabel}
      </div>
    );
  }

  if (url && !handleSelectManifestation) {
    return (
      <LinkNoStyle className={parentClass} url={url} data-cy={dataCy}>
        {availabilityLabel}
      </LinkNoStyle>
    );
  }

  return (
    <button
      className={parentClass}
      type="button"
      onClick={handleSelectManifestation}
      data-cy={dataCy}
      aria-pressed={selected}
    >
      {availabilityLabel}
    </button>
  );
};

export default memo(AvailabilityLabel);
