import React from "react";
import DigitalModal from "../../components/material/digital-modal/DigitalModal";
import RetrieverModal from "../../components/material/retriever/RetrieverModal";
import { hasCorrectAccess } from "../../components/material/material-buttons/helper";
import { PatronV5 } from "../../core/fbs/model";
import { isAnonymous, isBlocked } from "../../core/utils/helpers/user";
import { Manifestation } from "../../core/utils/types/entities";
import { WorkId } from "../../core/utils/types/ids";
import { getRetrieverIds } from "./helper";

export interface ArticleModalsProps {
  patron: PatronV5 | undefined;
  manifestation: Manifestation;
  workId: WorkId;
}

// An article button is rendered for every edition, so every edition that
// offers one needs a modal of its own to open.
const ArticleModals: React.FC<ArticleModalsProps> = ({
  patron,
  manifestation,
  workId
}) => {
  const isUserBlocked = !!(patron && isBlocked(patron));

  if (isAnonymous() || isUserBlocked) {
    return null;
  }

  const [retrieverId] = getRetrieverIds([manifestation]);
  const hasDigitalArticleAccess = hasCorrectAccess("DigitalArticleService", [
    manifestation
  ]);

  return (
    <>
      {retrieverId && (
        <RetrieverModal
          manifestation={manifestation}
          retrieverId={retrieverId}
        />
      )}
      {hasDigitalArticleAccess && (
        <DigitalModal pid={manifestation.pid} workId={workId} />
      )}
    </>
  );
};

export default ArticleModals;
