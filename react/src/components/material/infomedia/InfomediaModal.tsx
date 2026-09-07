import React, { useEffect, useState } from "react";
import { useGetInfomediaQuery } from "../../../core/dbc-gateway/generated/graphql";
import Modal from "../../../core/utils/modal";
import { useText } from "../../../core/utils/text";
import { useConfig } from "../../../core/utils/config";
import { Pid } from "../../../core/utils/types/ids";
import InfomediaModalBody from "./InfomediaModalBody";
import { Manifestation } from "../../../core/utils/types/entities";
import InfomediaSkeleton from "./InfomediaSkeleton";
import { isResident } from "../../../core/utils/helpers/userInfo";
import useUserInfo from "../../../core/adgangsplatformen/useUserInfo";
import {
  getManifestationAuthors,
  getManifestationTitle
} from "../../../apps/material/helper";
import { isAnonymous } from "../../../core/utils/helpers/user";

export const infomediaModalId = (pid: Pid) => `infomedia-modal-${pid}`;

interface InfomediaModalProps {
  manifestation: Manifestation;
  infoMediaId: string;
}

const InfomediaModal: React.FunctionComponent<InfomediaModalProps> = ({
  manifestation,
  infoMediaId
}) => {
  const t = useText();
  const config = useConfig();
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const { data: userInfo, isLoading: isLoadingUserInfo } = useUserInfo({
    enabled: !isAnonymous()
  });
  const siteAgencyId = config("agencyIdConfig");

  useEffect(() => {
    if (userInfo && siteAgencyId) {
      const userIsResident = isResident(userInfo, siteAgencyId);
      setShouldFetchData(userIsResident);
    }
  }, [userInfo, siteAgencyId]);

  const {
    data,
    error,
    isLoading: isLoadingInfomedia
  } = useGetInfomediaQuery(
    {
      id: infoMediaId
    },
    {
      enabled: shouldFetchData
    }
  );
  if (!data || error) {
    return null;
  }

  const author = getManifestationAuthors(manifestation);
  const title = getManifestationTitle(manifestation);

  return (
    <Modal
      modalId={infomediaModalId(manifestation.pid)}
      screenReaderModalDescriptionText={t(
        "infomediaModalScreenReaderModalDescriptionText"
      )}
      closeModalAriaLabelText={t("infomediaModalCloseModalAriaLabelText")}
      dataCy="infomedia-modal"
    >
      {(isLoadingUserInfo || isLoadingInfomedia) && <InfomediaSkeleton />}
      {data?.infomedia?.article && data.infomedia.article.text && (
        <InfomediaModalBody
          headLine={title}
          hedLine={data.infomedia.article.hedLine ?? ""}
          paper={data.infomedia.article.paper ?? ""}
          byLine={author}
          dateLine={data.infomedia.article.dateLine ?? ""}
          text={data.infomedia.article.text ?? ""}
        />
      )}
    </Modal>
  );
};

export default InfomediaModal;
