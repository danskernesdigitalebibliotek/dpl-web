import { FC } from "react";

export interface MaterialUnavailableNoticeProps {
  title: string;
  description: string;
  linkText?: string;
  linkUrl?: string;
}

export const MaterialUnavailableNotice: FC<MaterialUnavailableNoticeProps> = ({
  title,
  description,
  linkText,
  linkUrl,
}) => {
  return (
    <div className="material-unavailable-notice">
      <p className="material-unavailable-notice__title">{title}</p>
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
