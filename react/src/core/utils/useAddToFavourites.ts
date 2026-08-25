import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { ButtonFavouriteId } from "../../components/button-favourite/button-favourite";
import { guardedRequest } from "../guardedRequests.slice";
import { TypedDispatch } from "../store";

// Returns the "add material to favourites" action for ButtonFavourite's
// addToListRequest prop. The request is guarded: anonymous users are sent
// through login and the request replays afterwards.
const useAddToFavourites = () => {
  const dispatch = useDispatch<TypedDispatch>();
  const queryClient = useQueryClient();

  return useCallback(
    (id: ButtonFavouriteId) => {
      dispatch(
        guardedRequest({
          type: "addFavorite",
          args: { id, queryClient },
          app: "material"
        })
      );
    },
    [dispatch, queryClient]
  );
};

export default useAddToFavourites;
