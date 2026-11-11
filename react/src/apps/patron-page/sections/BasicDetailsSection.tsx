import React, { FC } from "react";
import { PatronV5 } from "../../../core/fbs/model";
import { useText } from "../../../core/utils/text";
interface BasicDetailsSectionProps {
  patron: PatronV5;
  /**
   * The identifier the user can hand to support: Publizon's friendly card
   * number or the service layer's support id - the caller picks the provider.
   */
  patronCardNumber?: string | null;
}

const BasicDetailsSection: FC<BasicDetailsSectionProps> = ({
  patron,
  patronCardNumber
}) => {
  const t = useText();
  const { name } = patron || {};

  return (
    <section>
      <h2 className="text-header-h4 mt-32 mb-16">
        {t("patronPageBasicDetailsHeaderText")}
      </h2>
      <div className="dpl-patron-info">
        {patronCardNumber && (
          <>
            <h3 className="dpl-patron-info__label text-header-h4">
              {t("patronPageBasicFriendlyCardNumberLabelText")}
            </h3>
            <div className="dpl-patron-info__text">{patronCardNumber}</div>
          </>
        )}
        <h3 className="dpl-patron-info__label text-header-h4">
          {t("patronPageBasicDetailsNameLabelText")}
        </h3>
        <div className="dpl-patron-info__text">{name}</div>
      </div>
    </section>
  );
};

export default BasicDetailsSection;
