import * as React from "react";
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
import { DigitalLoanableManifestation } from "../../../core/utils/helpers/digital-loanable-manifestation";

interface Props {
  manifestations: Manifestation[];
  /** The manifestation the header buttons lend, if they lend one. */
  loanableManifestation: DigitalLoanableManifestation | null;
}

const MaterialAvailabilityText: React.FC<Props> = ({
  manifestations,
  loanableManifestation
}) => {
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
    // Text and buttons ask about the same manifestation and share one request.
    // Nothing to lend means no text: the buttons cannot lend it either.
    if (!loanableManifestation) {
      return null;
    }
    return (
      <MaterialAvailabilityTextOnline
        loanableManifestation={loanableManifestation}
      />
    );
  }

  return null;
};

export default MaterialAvailabilityText;
