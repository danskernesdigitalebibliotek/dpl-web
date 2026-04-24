import React from "react";
import FeeListItemSkeleton from "./FeeListItemSkeleton";

const FeeListSkeleton: React.FC = () => {
  return (
    <section className="ssc fee-list">
      <h2 className="list-header__title" aria-label="Fee payment info">
        <div className="ssc-head-line w-20 mt-10" />
      </h2>
      <FeeListItemSkeleton />
      <FeeListItemSkeleton />
      <div className="ssc-head-line w-20 mt-48" />
      <FeeListItemSkeleton />
      <FeeListItemSkeleton />
    </section>
  );
};

export default FeeListSkeleton;
