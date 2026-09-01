import React from "react";
import { useText } from "../../../core/utils/text";
import { useUrls } from "../../../core/utils/url";
import Link from "../../atoms/links/Link";

export type MaterialUnavailableNoticeVariant = "compact" | "regular";

export interface MaterialUnavailableNoticeProps {
  /**
   * "regular" fills the space left by the material header buttons.
   * "compact" fits the narrow button column of the manifestation list and
   * shows a short description only - no title and no link.
   */
  variant?: MaterialUnavailableNoticeVariant;
}

// Shown in place of the action buttons when a material cannot be borrowed,
// reserved or opened through the website.
const MaterialUnavailableNotice: React.FC<MaterialUnavailableNoticeProps> = ({
  variant = "regular"
}) => {
  const t = useText();
  const u = useUrls();

  if (variant === "compact") {
    return (
      <div
        className="material-unavailable-notice material-unavailable-notice--compact"
        data-cy="material-unavailable-notice"
      >
        <p className="material-unavailable-notice__description">
          {t("materialUnavailableCompactDescriptionText")}
        </p>
      </div>
    );
  }

  // Libraries decide where to send the patron instead, so the url is optional -
  // without it we show the notice without a link rather than throwing.
  const materialUnavailableUrl = u("materialUnavailableUrl", true);

  return (
    <div
      className="material-unavailable-notice"
      data-cy="material-unavailable-notice"
    >
      <p className="material-unavailable-notice__title">
        {t("materialUnavailableTitleText")}
      </p>
      <p className="material-unavailable-notice__description">
        {t("materialUnavailableDescriptionText")}
        {materialUnavailableUrl && (
          <>
            {" "}
            <Link
              href={materialUnavailableUrl}
              className="material-unavailable-notice__link"
              dataCy="material-unavailable-notice-link"
              isNewTab
            >
              {t("materialUnavailableLinkText")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
};

export default MaterialUnavailableNotice;
