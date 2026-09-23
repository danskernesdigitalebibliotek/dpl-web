import * as React from "react";
import { FC } from "react";
import {
  getAllFaustIds,
  getMaterialType
} from "../../../core/utils/helpers/general";
import { ButtonSize } from "../../../core/utils/types/button";
import { Manifestation } from "../../../core/utils/types/entities";
import { WorkId } from "../../../core/utils/types/ids";
import MaterialButtonsOnline from "./online/MaterialButtonsOnline";
import MaterialButtonsFindOnShelf from "./physical/MaterialButtonsFindOnShelf";
import MaterialButtonsPhysical from "./physical/MaterialButtonsPhysical";
import MaterialButtonReservableFromAnotherLibrary from "./physical/MaterialButtonReservableFromAnotherLibrary";
import useReservableFromAnotherLibrary from "../../../core/utils/useReservableFromAnotherLibrary";
import { MaterialButtonsType } from "./resolveMaterialButtonsType";

export interface MaterialButtonsProps {
  type: MaterialButtonsType;
  isSpecificManifestation?: boolean;
  manifestations: Manifestation[];
  size?: ButtonSize;
  workId: WorkId;
  dataCy?: string;
  materialTitleId: string;
  isEditionPicker?: boolean;
}

const MaterialButtons: FC<MaterialButtonsProps> = ({
  type,
  isSpecificManifestation = false,
  manifestations,
  size,
  workId,
  dataCy = "material-buttons",
  materialTitleId,
  isEditionPicker = false
}) => {
  const faustIds = getAllFaustIds(manifestations);
  const { materialIsReservableFromAnotherLibrary } =
    useReservableFromAnotherLibrary(manifestations);

  switch (type.type) {
    case "physical":
      // Reserving from another library is a physical reservation, and it opens
      // the same modal the ordinary reserve button does.
      if (materialIsReservableFromAnotherLibrary) {
        return (
          <MaterialButtonReservableFromAnotherLibrary
            workId={workId}
            size={size}
            manifestationMaterialType={getMaterialType(manifestations)}
            faustIds={faustIds}
          />
        );
      }

      return (
        <>
          <MaterialButtonsPhysical
            manifestations={manifestations}
            size={size}
            dataCy={`${dataCy}-physical`}
            isSpecificManifestation={isSpecificManifestation}
            isEditionPicker={isEditionPicker}
          />
          {!isEditionPicker && (
            <MaterialButtonsFindOnShelf
              size={size}
              faustIds={faustIds}
              dataCy={`${dataCy}-find-on-shelf`}
              workId={workId}
            />
          )}
        </>
      );

    case "online":
      return (
        <MaterialButtonsOnline
          buttonKind={type.online}
          manifestations={manifestations}
          size={size}
          workId={workId}
          dataCy={`${dataCy}-online`}
          ariaLabelledBy={materialTitleId}
          isEditionPicker={isEditionPicker}
        />
      );
  }
};

export default MaterialButtons;
