import * as React from "react";
import {
  getAllIsbns,
  getLoanableManifestation,
  getManifestationDigitalIdentifier
} from "../../../apps/material/helper";
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
  const isbns = getAllIsbns(manifestations);
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
    isbns.length > 0 &&
    materialType
  ) {
    // The same identifier the loan buttons act on, so the availability text
    // and the buttons ask the providers about the same edition - and share
    // one request. Falls back to the first ISBN for a work whose loanable
    // pick carries no identifier of its own - another manifestation may
    // still have one, and rendering nothing would hide the text entirely.
    const loanableManifestation = getLoanableManifestation(manifestations);
    const identifier =
      (loanableManifestation &&
        getManifestationDigitalIdentifier(loanableManifestation)) ||
      isbns[0];
    return (
      <MaterialAvailabilityTextOnline
        identifier={identifier}
        materialType={materialType}
      />
    );
  }

  return null;
};

export default MaterialAvailabilityText;
