import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  GetMaterialDocument,
  GetMaterialQuery,
  GetMaterialQueryVariables
} from "../../core/dbc-gateway/generated/graphql";
import { fetcher } from "../../core/dbc-gateway/graphql-fetcher";
import { getMaterialTypes } from "../../core/utils/helpers/general";
import { Work } from "../../core/utils/types/entities";
import { WorkId } from "../../core/utils/types/ids";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import ErrorState from "./Errors/errorState";
import { GO_VIP_PROFILE_URL } from "./constants";

interface UseGetSelectedWorkOptions {
  useGoVipProfile?: boolean;
}

interface UseGetSelectedMaterialReturn {
  work: Work | null;
  selectedWorkId: WorkId | string;
  selectedMaterialType: ManifestationMaterialType | null;
  availableMaterialTypes: ManifestationMaterialType[] | null;
  isSelectedWorkLoading: boolean;
  errorState: ErrorState;
  setSelectedWorkId: (wid: WorkId | string) => void;
  setSelectedMaterialType: (
    materialType: ManifestationMaterialType | null
  ) => void;
}

const useGetSelectedWork = ({
  useGoVipProfile
}: UseGetSelectedWorkOptions = {}): UseGetSelectedMaterialReturn => {
  const [selectedWorkId, setSelectedWorkId] = useState<string>("");
  const [selectedMaterialType, setSelectedMaterialType] =
    useState<ManifestationMaterialType | null>(null);

  const [errorState, setErrorState] = useState<ErrorState>(ErrorState.NoError);

  const variables: GetMaterialQueryVariables = { wid: selectedWorkId };

  const queryFn = fetcher<GetMaterialQuery, GetMaterialQueryVariables>(
    GetMaterialDocument,
    variables,
    useGoVipProfile ? GO_VIP_PROFILE_URL : undefined
  );

  const {
    data,
    isLoading: isSelectedWorkLoading,
    refetch
  } = useQuery<GetMaterialQuery>({
    queryKey: [useGoVipProfile ? "getMaterial-go" : "getMaterial", variables],
    queryFn,
    enabled: !!selectedWorkId && selectedWorkId.length > 0
  });

  useEffect(() => {
    if (selectedWorkId) {
      refetch();
    }
  }, [selectedWorkId, selectedMaterialType, refetch]);

  // Validate the fetched work against the material type the user selected.
  useEffect(() => {
    if (!data) {
      return;
    }

    const fetchedWork = data.work as Work | null | undefined;

    if (!fetchedWork) {
      setErrorState(ErrorState.WorkError);
      return;
    }

    if (selectedMaterialType) {
      const fetchedMaterialTypes = getMaterialTypes(
        fetchedWork.manifestations.all,
        false
      );

      if (
        fetchedMaterialTypes &&
        !fetchedMaterialTypes.includes(selectedMaterialType)
      ) {
        setErrorState(ErrorState.MaterialTypeError);
        return;
      }
    }

    setErrorState(ErrorState.NoError);
  }, [data, selectedMaterialType]);

  const work = (data?.work as Work) ?? null;

  const availableMaterialTypes = work
    ? getMaterialTypes(work.manifestations.all, false)
    : null;

  return {
    work,
    availableMaterialTypes,
    selectedWorkId,
    setSelectedMaterialType,
    isSelectedWorkLoading,
    setSelectedWorkId,
    selectedMaterialType,
    errorState
  };
};

export default useGetSelectedWork;
