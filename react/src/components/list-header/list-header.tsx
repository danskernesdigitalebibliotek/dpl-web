import React, { FC, ReactNode } from "react";

export interface ListHeaderProps {
  header: string | ReactNode;
  amount: number | null;
  buttons?: ReactNode;
  dataCy?: string;
}

const ListHeader: FC<ListHeaderProps> = ({
  header,
  amount,
  buttons,
  dataCy = "list-header"
}) => {
  return (
    <div className="list-header">
      <h2 data-cy={dataCy} className="list-header__title">
        {header}
        {amount !== null && (
          <span className="list-header__count">{amount}</span>
        )}
      </h2>
      {buttons && <div className="list-header__actions">{buttons}</div>}
    </div>
  );
};
export default ListHeader;
