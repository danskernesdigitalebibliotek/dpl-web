import { AccessTypeCodeEnum } from "../../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../../core/utils/types/entities";
import { hasCorrectAccessType, isArticle } from "./helper";
import {
  OnlineButtonType,
  resolveOnlineButtonType
} from "./online/resolveOnlineButtonType";

export type MaterialButtonsType =
  { type: "physical" } | { type: "online"; online: OnlineButtonType };

/**
 * Decides which family of material buttons, if any, the given manifestations
 * support. Callers render the unavailable notice when this returns null.
 *
 * Physical and online buttons must never show together. Articles are the
 * sanctioned exception: a paper article carries both access types, and the
 * digital article button must still show for it. Articles are therefore
 * excluded from the physical kind and fall through to online.
 */
export const resolveMaterialButtonsType = (
  manifestations: Manifestation[]
): MaterialButtonsType | null => {
  if (
    hasCorrectAccessType(AccessTypeCodeEnum.Physical, manifestations) &&
    !isArticle(manifestations)
  ) {
    return { type: "physical" };
  }

  const online = resolveOnlineButtonType(manifestations);

  return online ? { type: "online", online } : null;
};
