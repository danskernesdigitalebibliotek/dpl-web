import React, { FC } from "react";

export const ActionList: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ul className="action-list">{children}</ul>
);

type ActionListItemType = {
  title: string;
  caption?: string;
  /** What the patron can do with the row, such as a button. */
  action: React.ReactNode;
};

export const ActionListItem: FC<ActionListItemType> = ({
  title,
  caption,
  action
}) => (
  <li className="action-list__item">
    <div>
      <h3 className="text-header-h5">{title}</h3>
      {caption && <p className="text-small-caption">{caption}</p>}
    </div>
    {action}
  </li>
);
