import React, { useEffect, useState } from "react";
import { useGetInfomediaQuery } from "../../../core/dbc-gateway/generated/graphql";
import Modal, { useIsModalOpen } from "../../../core/utils/modal";
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

  const modalId = infomediaModalId(manifestation.pid);
  const isModalOpen = useIsModalOpen(modalId);

  // The article body is only worth fetching once the reader asks for it: a
  // modal is rendered for every edition of the work, and each fetch returns a
  // whole article.
  const {
    data,
    error,
    isLoading: isLoadingInfomedia
  } = useGetInfomediaQuery(
    {
      id: infoMediaId
    },
    {
      enabled: shouldFetchData && isModalOpen
    }
  );

  if (error) {
    return null;
  }

  const author = getManifestationAuthors(manifestation);
  const title = getManifestationTitle(manifestation);

  return (
    <Modal
      modalId={modalId}
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
