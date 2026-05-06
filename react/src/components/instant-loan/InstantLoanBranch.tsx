import React from "react";
import { HoldingsLogistics } from "@dpl/fbs";
import AvailabilityLabelVisual from "../availability-label/availability-label-visual";

type InstantLoanBranchProps = {
  branch: HoldingsLogistics;
  materialType: string;
};

const InstantLoanBranch: React.FunctionComponent<InstantLoanBranchProps> = ({
  branch: {
    branch: { title },
    materials
  },
  materialType
}) => {
  return (
    <div className="instant-loan-branch px-24" data-cy="instant-loan-branch">
      <p className="text-header-h5">{title}</p>
      <AvailabilityLabelVisual
        manifestText={materialType}
        isAvailable
        quantity={materials.length}
      />
    </div>
  );
};

export default InstantLoanBranch;
