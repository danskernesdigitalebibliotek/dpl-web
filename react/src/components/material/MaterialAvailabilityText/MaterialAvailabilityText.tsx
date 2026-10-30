import * as React from "react";
import { getDigitalLoanable } from "../../reader-player/helper";
import { AccessTypeCodeEnum } from "../../../core/dbc-gateway/generated/graphql";
import {
  getAllPids,
  getMaterialType
} from "../../../core/utils/helpers/general";
import { Manifestation } from "../../../core/utils/types/entities";
import { hasCorrectAccessType } from "../material-buttons/helper";
import MaterialAvailabilityTextOnline from "./online/MaterialAvailabilityTextOnline";
import MaterialAvailabilityTextPhysical from "./physical/MaterialAvailabilityTextPhysical";
import useReservableFromAnotherLibrary from "../../../core/utils/useReservableFromAnotherLibrary";
import MaterialAvailabilityTextParagraph from "./generic/MaterialAvailabilityTextParagraph";
import { useText } from "../../../core/utils/text";

interface Props {
  manifestations: Manifestation[];
}

const MaterialAvailabilityText: React.FC<Props> = ({ manifestations }) => {
  const t = useText();
  const materialType = getMaterialType(manifestations);
  const { materialIsReservableFromAnotherLibrary } =
    useReservableFromAnotherLibrary(manifestations);

  if (hasCorrectAccessType(AccessTypeCodeEnum.Physical, manifestations)) {
    const pids = getAllPids(manifestations);
    if (materialIsReservableFromAnotherLibrary) {
      return (
        <MaterialAvailabilityTextParagraph>
          {t("reservableFromAnotherLibraryText")}
        </MaterialAvailabilityTextParagraph>
      );
    }
    return <MaterialAvailabilityTextPhysical pids={pids} />;
  }

  if (
    hasCorrectAccessType(AccessTypeCodeEnum.Online, manifestations) &&
    materialType
  ) {
    // A pick nothing can be lent from renders no text: the buttons cannot
    // lend it either.
    const loanable = getDigitalLoanable(manifestations);
    if (!loanable) {
      return null;
    }
    return (
      <MaterialAvailabilityTextOnline
        identifier={loanable.id}
        materialType={materialType}
      />
    );
  }

  return null;
};

export default MaterialAvailabilityText;
