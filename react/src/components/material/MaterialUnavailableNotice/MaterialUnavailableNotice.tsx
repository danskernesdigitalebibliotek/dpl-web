import React from "react";
import { useText } from "../../../core/utils/text";
import { useUrls } from "../../../core/utils/url";
import Link from "../../atoms/links/Link";

// Shown in place of the action buttons when a material cannot be borrowed,
// reserved or opened through the website.
const MaterialUnavailableNotice: React.FC = () => {
  const t = useText();
  const u = useUrls();
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
