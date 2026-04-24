import React, { FC, ReactNode } from "react";

export interface ListHeaderProps {
  header: string;
  amount: number;
  children?: ReactNode;
}

const ListHeader: FC<ListHeaderProps> = ({ header, amount, children }) => {
  return (
    <div className="list-header m-32">
      <h2 className="list-header__title">
        {header}
        <span className="list-header__count">{amount}</span>
      </h2>
      {children}
    </div>
  );
};
export default ListHeader;
