import {
  CopyRequestStatusEnum,
  PlaceCopyMutation
} from "../../../core/dbc-gateway/generated/graphql";
import { UseTextFunction } from "../../../core/utils/text";
import { Pid } from "../../../core/utils/types/ids";

export const createDigitalModalId = (id: Pid) => `digital-modal-${id}`;

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
