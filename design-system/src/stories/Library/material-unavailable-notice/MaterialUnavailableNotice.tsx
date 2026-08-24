import { FC } from "react";

export type MaterialUnavailableNoticeVariant = "compact" | "regular";

export interface MaterialUnavailableNoticeProps {
  description: string;
  // The title and the link are only rendered by the regular variant.
  title?: string;
  linkText?: string;
  linkUrl?: string;
  variant?: MaterialUnavailableNoticeVariant;
}

export const MaterialUnavailableNotice: FC<MaterialUnavailableNoticeProps> = ({
  description,
  title,
  linkText,
  linkUrl,
  variant = "regular",
}) => {
  if (variant === "compact") {
    return (
      <div className="material-unavailable-notice material-unavailable-notice--compact">
        <p className="material-unavailable-notice__description">
          {description}
        </p>
      </div>
    );
  }

  return (
    <div className="material-unavailable-notice">
      {title && <p className="material-unavailable-notice__title">{title}</p>}
      <p className="material-unavailable-notice__description">
        {description}
        {linkText && linkUrl && (
          <>
            {" "}
            <a
              href={linkUrl}
              className="material-unavailable-notice__link"
              target="_blank"
              rel="noreferrer"
            >
              {linkText}
            </a>
          </>
        )}
      </p>
    </div>
  );
};

export default MaterialUnavailableNotice;
