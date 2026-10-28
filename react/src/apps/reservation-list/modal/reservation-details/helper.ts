import { FormSelectValue } from "../../../../components/reservation/forms/types";
import { getFutureDateString } from "../../../../core/utils/helpers/date";

export const getReservationsForSaving = ({
  formSelectValue,
  reservationIds,
  expiryDate,
  selectedBranch
}: {
  formSelectValue: FormSelectValue;
  reservationIds: number[];
  expiryDate?: string | null;
  selectedBranch: string;
}) => {
  const getSelectedExpiryDate = (value: FormSelectValue) =>
    typeof value === "number" ? getFutureDateString(value) : (expiryDate ?? "");
  const getSelectedPickupBranch = (value: FormSelectValue) =>
    typeof value === "string" ? value : selectedBranch;

  return reservationIds.map((reservationId) => {
    return {
      expiryDate: getSelectedExpiryDate(formSelectValue),
      pickupBranch: getSelectedPickupBranch(formSelectValue),
      reservationId
    };
  });
};
