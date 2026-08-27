import * as React from "react";
import {
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
    // The same identifier the loan buttons act on, so the availability text
    // and the buttons ask the providers about the same edition - and share
    // one request. A loanable pick without any identifier of its own renders
    // no text: the buttons cannot lend it either, and describing some other
    // edition's availability here would promise what the buttons cannot
    // deliver - or, with the adapter on, fire a can-loan request keyed to an
    // edition it may not know.
    const loanableManifestation = getLoanableManifestation(manifestations);
    const identifier = loanableManifestation
      ? getManifestationDigitalIdentifier(loanableManifestation)
      : null;
    if (!identifier) {
      return null;
    }
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
