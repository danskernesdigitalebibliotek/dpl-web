import * as React from "react";
import { FC } from "react";
import InvalidUrlError from "../../../../core/errors/InvalidUrlError";
import { statistics } from "../../../../core/statistics/statistics";
import { useEventStatistics } from "../../../../core/statistics/useStatistics";
import { isUrlValid } from "../../../../core/utils/helpers/url";
import { ButtonSize } from "../../../../core/utils/types/button";
import { Manifestation } from "../../../../core/utils/types/entities";
import { WorkId } from "../../../../core/utils/types/ids";
import MaterialButtonOnlineDigitalArticle from "./MaterialButtonOnlineDigitalArticle";
import MaterialButtonOnlineExternal from "./MaterialButtonOnlineExternal";
import MaterialButtonOnlineRetrieverArticle from "./MaterialButtonOnlineRetrieverArticle";
import MaterialButtonsOnlineInternal from "./MaterialButtonsOnlineInternal";
import { isBlocked } from "../../../../core/utils/helpers/user";
import { usePatronData } from "../../../../core/utils/helpers/usePatronData";
import MaterialButtonUserBlocked from "../generic/MaterialButtonUserBlocked";
import { OnlineButtonType } from "./resolveOnlineButtonType";

export interface MaterialButtonsOnlineProps {
  type: OnlineButtonType;
  manifestations: Manifestation[];
  size?: ButtonSize;
  workId: WorkId;
  dataCy?: string;
  ariaLabelledBy: string;
  isEditionPicker?: boolean;
}

const MaterialButtonsOnline: FC<MaterialButtonsOnlineProps> = ({
  type,
  manifestations,
  size,
  workId,
  dataCy = "material-buttons-online",
  ariaLabelledBy,
  isEditionPicker = false
}) => {
  const { track } = useEventStatistics();
  const { data: userData } = usePatronData();
  // The article modals are only rendered for a patron who is not blocked, so
  // without this the button would be live with nothing behind it.
  const isUserBlocked = !!(userData?.patron && isBlocked(userData.patron));
  const trackOnlineView = () => {
    return track("click", {
      id: statistics.onlineReservation.id,
      name: statistics.onlineReservation.name,
      trackedData: workId
    });
  };

  switch (type.type) {
    case "internal":
      return (
        <MaterialButtonsOnlineInternal
          openModal
          size={size}
          manifestations={manifestations}
          dataCy={`${dataCy}-internal`}
          workId={workId}
          isEditionPicker={isEditionPicker}
        />
      );

    case "external": {
      const { origin, url: externalUrl } = type.access;

      //  We have experienced that externalUrl is not always valid.
      if (!isUrlValid(externalUrl)) {
        throw new InvalidUrlError(
          `The external url is not valid. ( ${externalUrl} )`
        );
      }

      return (
        <MaterialButtonOnlineExternal
          externalUrl={externalUrl}
          origin={origin}
          size={size}
          trackOnlineView={trackOnlineView}
          manifestations={manifestations}
          dataCy={`${dataCy}-external`}
          ariaLabelledBy={ariaLabelledBy}
        />
      );
    }

    case "digital-article":
      if (isUserBlocked) {
        return <MaterialButtonUserBlocked size={size} dataCy={dataCy} />;
      }

      return (
        <MaterialButtonOnlineDigitalArticle
          pid={manifestations[0].pid}
          size={size}
          dataCy={`${dataCy}-digital-article`}
        />
      );

    case "retriever-article":
      if (isUserBlocked) {
        return <MaterialButtonUserBlocked size={size} dataCy={dataCy} />;
      }

      return (
        <MaterialButtonOnlineRetrieverArticle
          size={size}
          manifestations={manifestations}
          trackOnlineView={trackOnlineView}
          dataCy={`${dataCy}-retriever-article`}
        />
      );
  }
};

export default MaterialButtonsOnline;
