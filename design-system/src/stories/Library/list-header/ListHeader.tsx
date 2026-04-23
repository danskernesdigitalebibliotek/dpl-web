import "./list-header.scss";

import { FC, ReactNode } from "react";

export interface ListHeaderProps {
  header: string;
  count: string;
  children?: ReactNode;
}

export const ListHeader: FC<ListHeaderProps> = ({
  header,
  count,
  children,
}) => {
  return (
    <div className="list-header">
      <h2 className="list-header__title">
        {header}
        <span className="list-header__count">{count}</span>
      </h2>
      {children && <div className="list-header__actions">{children}</div>}
    </div>
  );
};
