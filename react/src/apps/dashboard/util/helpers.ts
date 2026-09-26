import {
  getNextWeekDate,
  getNextYearDate,
  getYesterdayDate
} from "../../../core/utils/helpers/date";

export const yesterday = getYesterdayDate();
export const soon = getNextWeekDate();
export const longer = getNextYearDate();
