import React, { FC } from "react";
import { useText } from "../../../core/utils/text";

type QuotaBarProps = {
  id: string;
  labelTextKey: string;
  ariaLabelTextKey: string;
  current: number;
  limit: number | undefined;
};

/**
 * Progress bar showing how much of a loan quota the patron has used.
 * A missing or zero limit reads as a full bar.
 */
export const QuotaBar: FC<QuotaBarProps> = ({
  id,
  labelTextKey,
  ariaLabelTextKey,
  current,
  limit
}) => {
  const t = useText();
  const usedPercent = limit ? (current / limit) * 100 : 100;

  return (
    <div className="dpl-progress-bar text-small-caption color-secondary-gray">
      <div className="dpl-progress-bar__header">
        <label className="text-label" htmlFor={id}>
          {t(labelTextKey)}
        </label>
        {limit !== undefined && (
          <div className="text-label" id={id}>
            {t("patronPageStatusSectionOutOfText", {
              placeholders: { "@this": current, "@that": limit }
            })}
          </div>
        )}
      </div>
      <div className="dpl-progress-bar__progress-bar bg-global-secondary">
        {limit !== undefined && (
          <div
            className="bg-identity-primary"
            role="figure"
            aria-label={t(ariaLabelTextKey, {
              placeholders: { "@this": current, "@that": limit }
            })}
            style={{ width: `${usedPercent}%` }}
          />
        )}
      </div>
    </div>
  );
};
