import React, { ReactNode } from "react";
import clsx from "clsx";

type CollapsibleProps = {
  isOpen: boolean;
  children: ReactNode;
};

/**
 * Animates its content open and closed vertically. The content stays in the
 * DOM while collapsed, but is made inert so it can't be focused or read.
 */
export const Collapsible = ({ isOpen, children }: CollapsibleProps) => (
  <div className={clsx("collapsible", !isOpen && "collapsible--closed")}>
    <div className="collapsible__content" inert={!isOpen}>
      {children}
    </div>
  </div>
);
