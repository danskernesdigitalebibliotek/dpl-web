import { useDispatch } from "react-redux";
import { ButtonFavouriteId } from "./button-favourite";
import { TypedDispatch } from "../../core/store";
import { useCallback } from "react";
import { guardedRequest } from "../../core/guardedRequests.slice";
import { GuardedAppId } from "../../core/utils/types/ids";
import { QueryClient } from "@tanstack/react-query";

/**
 * Returns an "add to favorite" function that can be passed to the ButtonFavourite component.
 *
 * @param options Request options
 * @param options.app The app for which the favorite is being added
 * @param options.queryClient Optional QueryClient instance for React Query.
 *
 * @returns A function that takes a ButtonFavouriteId
 */
export const useAddFavorite = (options: {
  app: GuardedAppId;
  queryClient?: QueryClient;
}) => {
  const dispatch = useDispatch<TypedDispatch>();
  const { queryClient, app } = options;

  return useCallback(
    (id: ButtonFavouriteId) => {
      const args = queryClient ? { id, queryClient } : { id };

      dispatch(
        guardedRequest({
          type: "addFavorite",
          args: args,
          app
        })
      );
    },
    [app, dispatch, queryClient]
  );
};
