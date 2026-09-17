import React, { useRef } from "react";
import {
  ButtonSize,
  ButtonType,
  ButtonVariant
} from "../../core/utils/types/button";
import { Button } from "./Button";
import { redirectTo } from "../../core/utils/helpers/url";

export interface LinkButtonProps {
  buttonType?: ButtonType;
  children: string;
  classNames?: string;
  dataCy?: string;
  iconClassNames?: string;
  isNewTab?: boolean;
  size: ButtonSize;
  trackClick?: () => Promise<unknown>;
  url: URL;
  variant: ButtonVariant;
  ariaLabelledBy?: string;
  id?: string;
}

const LinkButton: React.FC<LinkButtonProps> = ({
  buttonType,
  children,
  classNames,
  dataCy = "link-button",
  iconClassNames,
  isNewTab = false,
  size = "medium",
  trackClick,
  url,
  variant = "filled",
  ariaLabelledBy,
  id
}) => {
  // Tracking holds the navigation back for a moment, and a second click in
  // that window would send the event twice. The guard spans only that wait:
  // a lock that never lets go outlives the click when the page comes back
  // from the back/forward cache, leaving a dead button.
  const isNavigating = useRef(false);
  const navigate = () => {
    if (!trackClick) {
      redirectTo(url, isNewTab);
      return;
    }
    if (isNavigating.current) return;
    isNavigating.current = true;
    const release = () => {
      isNavigating.current = false;
    };
    trackClick()
      .then(() => redirectTo(url, isNewTab))
      .then(release, release);
  };

  return (
    <Button
      variant={variant}
      size={size}
      buttonType={buttonType || "none"}
      classNames={classNames}
      iconClassNames={iconClassNames}
      onClick={navigate}
      dataCy={dataCy}
      ariaDescribedBy={ariaLabelledBy}
      id={id}
      label={children}
      collapsible={false}
    />
  );
};

export default LinkButton;
