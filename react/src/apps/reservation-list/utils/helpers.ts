import {
  calculateRoundedUpDaysUntil,
  formatDateDependingOnDigitalMaterial,
  formatDateTimeUtc
} from "../../../core/utils/helpers/date";
import { UseTextFunction } from "../../../core/utils/text";
import { ReservationType } from "../../../core/utils/types/reservation-type";

export const infoLabelTextType = {
  pickUpLatest: "reservationPickUpLatestText",
  loanBefore: "reservationListLoanBeforeText"
} as const;

export const getReservationStatusInfoLabel = ({
  pickupBranch,
  date,
  isDigital,
  t
}: {
  pickupBranch: string | null | undefined;
  date: string;
  isDigital: boolean;
  t: UseTextFunction;
}) => {
  const textKey = pickupBranch
    ? infoLabelTextType.pickUpLatest
    : infoLabelTextType.loanBefore;

  return t(textKey, {
    placeholders: {
      "@date": formatDateDependingOnDigitalMaterial({
        date,
        isDigital
      })
    }
  });
};

/**
 * Generates a status text based on reservation details.
 */
export const getStatusText = (
  { identifier, state, pickupDeadline, faust, numberInQueue }: ReservationType,
  t: UseTextFunction
): string => {
  if (identifier && state === "reserved") {
    if (!pickupDeadline) {
      return t("reservationListYouAreInQueueText");
    }

    return t("reservationListAvailableInText", {
      placeholders: {
        "@count": calculateRoundedUpDaysUntil(pickupDeadline)
      }
    });
  }

  if (faust && numberInQueue) {
    return t("dashboardNumberInLineText", {
      count: numberInQueue,
      placeholders: { "@count": numberInQueue }
    });
  }

  return "";
};

export default {};

if (import.meta.vitest) {
  const { describe, expect, it } = import.meta.vitest;

  describe("getReservationStatusInfoLabel", () => {
    const testDate = "12-12-2012 12:12";
    // Digital materials use UTC time formatting
    const expectedUtcDate = formatDateTimeUtc(testDate);

    it("Should deliver correct label for a DIGITAL material when providing a branch", () => {
      const output = getReservationStatusInfoLabel({
        pickupBranch: "SOME-BRANCH",
        date: testDate,
        isDigital: true,
        t: (key, options) =>
          JSON.stringify({
            key,
            options
          })
      });

      expect(output).toBe(
        `{"key":"reservationPickUpLatestText","options":{"placeholders":{"@date":"${expectedUtcDate}"}}}`
      );
    });
    it("Should deliver correct label for a DIGITAL material when NOT providing a branch", () => {
      const output = getReservationStatusInfoLabel({
        pickupBranch: null,
        date: testDate,
        isDigital: true,
        t: (key, options) =>
          JSON.stringify({
            key,
            options
          })
      });

      expect(output).toBe(
        `{"key":"reservationListLoanBeforeText","options":{"placeholders":{"@date":"${expectedUtcDate}"}}}`
      );
    });
    it("Should deliver correct label for a NON DIGITAL material when providing a branch", () => {
      const output = getReservationStatusInfoLabel({
        pickupBranch: "SOME-BRANCH",
        date: "12-12-2012 12:12",
        isDigital: false,
        t: (key, options) =>
          JSON.stringify({
            key,
            options
          })
      });

      expect(output).toBe(
        `{"key":"reservationPickUpLatestText","options":{"placeholders":{"@date":"12-12-2012"}}}`
      );
    });
    it("Should deliver correct label for a NON DIGITAL material when NOT providing a branch", () => {
      const output = getReservationStatusInfoLabel({
        pickupBranch: null,
        date: "12-12-2012 12:12",
        isDigital: false,
        t: (key, options) =>
          JSON.stringify({
            key,
            options
          })
      });

      expect(output).toBe(
        `{"key":"reservationListLoanBeforeText","options":{"placeholders":{"@date":"12-12-2012"}}}`
      );
    });
  });
}
