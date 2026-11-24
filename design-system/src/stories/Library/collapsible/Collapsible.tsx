import clsx from "clsx";
import { FC, ReactNode } from "react";

export type CollapsibleProps = {
  isOpen: boolean;
  children: ReactNode;
};

const Collapsible: FC<CollapsibleProps> = ({ isOpen, children }) => (
  <div className={clsx("collapsible", { "collapsible--closed": !isOpen })}>
    {/* React 18 doesn't know inert yet, so it's set as a plain attribute */}
    <div className="collapsible__content" {...(!isOpen && { inert: "" })}>
      {children}
    </div>
  </div>
);

export default Collapsible;
