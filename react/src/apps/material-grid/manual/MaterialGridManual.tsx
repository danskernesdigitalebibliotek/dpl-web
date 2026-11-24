import * as React from "react";
import MaterialGrid, {
  MaterialGridItemProps
} from "../../../components/material-grid/MaterialGrid";

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
  return (
    <MaterialGrid
      title={title}
      description={description}
      materials={materials}
      useShowAllButton={useShowAllButton}
      initialMaximumDisplay={useShowAllButton ? undefined : materials.length}
    />
  );
};
export default MaterialGridManual;
