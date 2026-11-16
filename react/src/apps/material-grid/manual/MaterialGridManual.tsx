import * as React from "react";
import MaterialGrid, {
  MaterialGridItemProps
} from "../../../components/material-grid/MaterialGrid";
import { useText } from "../../../core/utils/text";

export type MaterialGridManualProps = {
  materials: MaterialGridItemProps[];
  title?: string;
  description?: string;
  useShowAllButton?: boolean;
};

const MaterialGridManual: React.FC<MaterialGridManualProps> = ({
  materials,
  title,
  description,
  useShowAllButton
}) => {
  const t = useText();
  const buttonText = t("buttonText");

  return (
    <MaterialGrid
      title={title}
      description={description}
      materials={materials}
      buttonText={buttonText}
      useShowAllButton={useShowAllButton}
    />
  );
};
export default MaterialGridManual;
