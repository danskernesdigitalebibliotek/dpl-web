import {
  CopyRequestStatusEnum,
  DigitalArticleService,
  PlaceCopyMutation
} from "../../../core/dbc-gateway/generated/graphql";
import { UseTextFunction } from "../../../core/utils/text";
import { Manifestation } from "../../../core/utils/types/entities";
import { IssnId, Pid } from "../../../core/utils/types/ids";

// A Pid contains a colon (e.g. "870971-tsart:34310815"). When an anonymous user
// orders a digital copy, the modal id is carried through the login redirect as a
// URL query parameter and re-read on return. Reserved characters like the colon
// get percent-encoded on the way out but are not consistently decoded on the way
// back, so a raw-Pid id no longer matches the mounted modal and it fails to open
// (while the body scroll stays locked). Sanitising the id to URL-safe characters
// keeps it stable across the round-trip. Both the button and the modal build the
// id through this function, so they stay in sync.
export const createDigitalModalId = (id: Pid) =>
  `digital-modal-${id.replace(/[^a-zA-Z0-9-]/g, "-")}`;

export const getDigitalArticleIssnIds = (manifestations: Manifestation[]) => {
  const digitalArticles = manifestations.map(
    (manifestation) =>
      manifestation.access.find(
        ({ __typename }) => __typename === "DigitalArticleService"
      ) as DigitalArticleService
  );

  return digitalArticles.map((article) => article.issn) as IssnId[];
};

export const constantCaseToTitleCase = (string: string) => {
  return string
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

export const getResponseMessage = (
  articleResponse: PlaceCopyMutation | undefined,
  t: UseTextFunction
) => {
  return articleResponse
    ? Object.values(CopyRequestStatusEnum).reduce(
        (acc: { [key: string]: string }, current) => {
          return {
            ...acc,
            [current]: t(
              `orderDigitalCopyFeedback${constantCaseToTitleCase(current)}Text`
            )
          };
        },
        {}
      )[articleResponse.elba.placeCopyRequest.status]
    : null;
};

export default {};
