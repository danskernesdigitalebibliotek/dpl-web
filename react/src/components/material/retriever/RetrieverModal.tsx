import React, { useEffect, useState } from "react";
import { useGetRetrieverQuery } from "../../../core/dbc-gateway/generated/graphql";
import Modal, { useIsModalOpen } from "../../../core/utils/modal";
import { useText } from "../../../core/utils/text";
import { useConfig } from "../../../core/utils/config";
import { Pid } from "../../../core/utils/types/ids";
import RetrieverModalBody from "./RetrieverModalBody";
import { Manifestation } from "../../../core/utils/types/entities";
import RetrieverSkeleton from "./RetrieverSkeleton";
import { isResident } from "../../../core/utils/helpers/userInfo";
import useUserInfo from "../../../core/adgangsplatformen/useUserInfo";
import {
  getManifestationAuthors,
  getManifestationTitle
} from "../../../apps/material/helper";
import { isAnonymous } from "../../../core/utils/helpers/user";

export const retrieverModalId = (pid: Pid) => `retriever-modal-${pid}`;

interface RetrieverModalProps {
  manifestation: Manifestation;
  retrieverId: string;
}

const RetrieverModal: React.FunctionComponent<RetrieverModalProps> = ({
  manifestation,
  retrieverId
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

  const modalId = retrieverModalId(manifestation.pid);
  const isModalOpen = useIsModalOpen(modalId);

  // The article body is only worth fetching once the reader asks for it: a
  // modal is rendered for every edition of the work, and each fetch returns a
  // whole article.
  const {
    data,
    error,
    isLoading: isLoadingRetriever
  } = useGetRetrieverQuery(
    {
      id: retrieverId
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
        "retrieverModalScreenReaderModalDescriptionText"
      )}
      closeModalAriaLabelText={t("retrieverModalCloseModalAriaLabelText")}
      dataCy="retriever-modal"
    >
      {(isLoadingUserInfo || isLoadingRetriever) && <RetrieverSkeleton />}
      {data?.retriever?.article && data.retriever.article.fullTextHtml && (
        <RetrieverModalBody
          headline={title}
          subHeadline={data.retriever.article.subHeadline ?? ""}
          sourceName={data.retriever.article.sourceName ?? ""}
          byLine={author}
          publishingDate={data.retriever.article.publishingDate ?? ""}
          textHtml={data.retriever.article.fullTextHtml ?? ""}
        />
      )}
    </Modal>
  );
};

export default RetrieverModal;
