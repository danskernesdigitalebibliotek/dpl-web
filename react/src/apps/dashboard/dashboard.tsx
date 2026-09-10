import React, { FC } from "react";
import DashboardFees from "./dashboard-fees/dashboard-fees";
import DashboardNotificationList from "./dashboard-notification-list/dashboard-notification-list";
import { useText } from "../../core/utils/text";
import useLoans from "../../core/utils/useLoans";
import useReservations from "../../core/utils/useReservations";

interface DashboardProps {
  pageSize: number;
}

const DashBoard: FC<DashboardProps> = ({ pageSize }) => {
  const t = useText();

  const loans = useLoans();
  const reservations = useReservations();

  return (
    <div className="dashboard-page">
      <h1 className="text-header-h1 mt-32 mb-64" data-cy="dashboard-header">
        {t("yourProfileText")}
      </h1>
      <DashboardFees />
      <DashboardNotificationList
        columns
        pageSize={pageSize}
        loans={loans}
        reservations={reservations}
      />
    </div>
  );
};

export default DashBoard;
