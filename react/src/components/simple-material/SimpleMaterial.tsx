import * as React from "react";
import { FC } from "react";
import ButtonFavourite from "../button-favourite/button-favourite";
import { Cover } from "../cover/cover";
import { getContributors, getWorkPid } from "../../core/utils/helpers/general";
import { constructMaterialUrl } from "../../core/utils/helpers/url";
import Link from "../atoms/links/Link";
import { useUrls } from "../../core/utils/url";
import { GuardedAppId } from "../../core/utils/types/ids";
import { WorkSmall } from "../../core/utils/types/entities";
import { useAddFavorite } from "../button-favourite/useAddFavorite";

export interface SimpleMaterialProps {
  work: WorkSmall;
  bright?: boolean;
  app: GuardedAppId;
}

const SimpleMaterial: FC<SimpleMaterialProps> = ({
  bright,
  work: {
    titles: { full: fullTitle },
    creators,
    workId
  },
  work,
  app
}) => {
  const u = useUrls();
  const materialUrl = u("materialUrl");

  const materialFullUrl = constructMaterialUrl(materialUrl, workId);

  // Create authors string
  let authors = null;
  const inputContributorsArray = creators?.map(({ display }) => display);
  if (inputContributorsArray) {
    authors = getContributors(true, inputContributorsArray);
  }

  // For retrieving cover
  const manifestationPid = getWorkPid(work);

  const addToListRequest = useAddFavorite({ app });

  const title = fullTitle[0];

  return (
    <li
      className={`simple-material ${bright ? " simple-material--bright" : ""}`}
    >
      <div className="simple-material__cover-container">
        <Cover animate size="medium" ids={[manifestationPid]} />
      </div>
      <div className="simple-material__favourite">
        <ButtonFavourite
          title={title}
          darkBackground={!bright}
          id={workId}
          addToListRequest={addToListRequest}
        />
      </div>
      <div className="simple-material__meta">
        <Link href={materialFullUrl} className="simple-material__title">
          {title}
        </Link>
        <div className="simple-material__author">{authors}</div>
      </div>
    </li>
  );
};

export default SimpleMaterial;
