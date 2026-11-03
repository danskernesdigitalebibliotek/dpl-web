import { afterEach, describe, expect, it, vi } from "vitest";
import dayjs from "dayjs";
import {
  calculateRoundedUpDaysUntil,
  dateHasPassed,
  formatDate,
  formatDateDependingOnDigitalMaterial,
  formatDateTime,
  formatDateTimeUtc,
  getBiblioDueDate
} from "../../core/utils/helpers/date";
import {
  dateFormatDash,
  dateFormatDashWithTime
} from "../../core/configuration/date-format";

// We're describing a test suite for the `dateHasPassed` function
describe("formatDate helper function", () => {
  it('should correctly format the date in "DD-MM-YYYY" format', () => {
    // Prepare a date string for testing
    const testDate = "2022-01-01";

    // Call our function with the test date
    const result = formatDate(testDate);

    // We use dayjs to format the test date in the same way as our function
    // This will be the expected result
    const expectedResult = dayjs(testDate).format(dateFormatDash);

    // We compare the result of our function to the expected result
    // If they match, our function is working correctly
    expect(result).toEqual(expectedResult);
  });
});

// We are going to test our "formatDateTime" function
describe("formatDateTime", () => {
  // We need to test whether the function correctly formats the dates
  it("should correctly format dates", () => {
    // Test data
    const date = "2022-04-22T14:30:00Z";

    // Expected result from the function
    const expectedResult = dayjs(date).format(dateFormatDashWithTime);

    // Call the function with the test data
    const result = formatDateTime(date);

    // Check if the result is as expected
    expect(result).toEqual(expectedResult);
  });
  // We need to test whether the function correctly formats the dates
});

describe("Date helper tests", () => {
  // Test for formatDateTime function
  it("should correctly format date and time", () => {
    const date = dayjs().format(); // Get current date
    const formattedDate = formatDateTime(date);
    expect(formattedDate).toBe(dayjs(date).format(dateFormatDashWithTime));
  });
  // Test for formatDate function
  it("should correctly format date", () => {
    const date = dayjs().format(); // Get current date
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe(dayjs(date).format(dateFormatDash));
  });
  // Test for formatDateDependingOnDigitalMaterial function
  it("should format date depending on digital material", () => {
    const date = dayjs().format(); // Get current date
    const digitalMaterial = { date, isDigital: true };
    const nonDigitalMaterial = { date, isDigital: false };

    const formattedDigitalMaterialDate =
      formatDateDependingOnDigitalMaterial(digitalMaterial);
    const formattedNonDigitalMaterialDate =
      formatDateDependingOnDigitalMaterial(nonDigitalMaterial);

    // Check if date is formatted correctly depending on whether material is digital or not
    // Digital materials use UTC time formatting
    expect(formattedDigitalMaterialDate).toBe(formatDateTimeUtc(date));
    expect(formattedNonDigitalMaterialDate).toBe(
      dayjs(date).format(dateFormatDash)
    );
  });
});

describe("getBiblioDueDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [
      "an older Biblio loan, ending at the end of the UTC day",
      "2026-11-20T23:59:59.999Z"
    ],
    [
      "a Biblio loan ending at the end of the Danish winter day",
      "2026-11-20T22:59:59.999Z"
    ]
  ])("gives the last day of %s", (_, end) => {
    expect(getBiblioDueDate(end)).toBe("2026-11-20");
  });

  it("gives the last day of a loan ending at the end of the Danish summer day", () => {
    expect(getBiblioDueDate("2026-06-20T21:59:59.999Z")).toBe("2026-06-20");
  });

  it("is due, not overdue, all through its last day", () => {
    const dueDate = getBiblioDueDate("2026-11-20T23:59:59.999Z");

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-20T22:30:00Z"));
    expect(formatDate(dueDate)).toBe("20-11-2026");
    expect(calculateRoundedUpDaysUntil(dueDate)).toBeCloseTo(0);
    expect(dateHasPassed(dueDate)).toBe(false);

    vi.setSystemTime(new Date("2026-11-20T23:30:00Z"));
    expect(dateHasPassed(dueDate)).toBe(true);
  });
});
