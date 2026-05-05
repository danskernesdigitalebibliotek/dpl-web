import { RenewedLoan } from "@dpl/service-layer/fbs";
import { UseTextFunction } from "../text";
import { RenewStatus } from "../types/renew-status";
import { RequestStatus } from "../types/request";

export const filterRenewResponseData = (data: RenewedLoan[]) => {
  return data.filter((loan) => loan.renewalStatus[0] === RenewStatus.renewed);
};

export const succeededRenewalCount = (renewingResponse: RenewedLoan[] | null) =>
  filterRenewResponseData(renewingResponse || []).length;

export const getRenewButtonLabel = ({
  isRenewable,
  renewingStatus,
  t,
  defaultText
}: {
  isRenewable: boolean;
  renewingStatus: RequestStatus;
  t: UseTextFunction;
  defaultText?: string;
}) => {
  if (!isRenewable) {
    return t("renewCannotBeRenewedText");
  }
  if (renewingStatus === "pending") {
    return t("renewProcessingText");
  }

  return defaultText ?? t("renewButtonText");
};
