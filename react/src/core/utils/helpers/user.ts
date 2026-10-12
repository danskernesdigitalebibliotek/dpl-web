import { isEmpty } from "lodash";
import { Patron } from "../types/entities";
import {
  getToken,
  TOKEN_UNREGISTERED_USER_KEY,
  TOKEN_USER_KEY,
  hasToken
} from "../../token";

export const isAnonymous = () => {
  return !hasToken("user");
};

// A registered patron: the CMS only hands out a "user" token for one, never
// for an unregistered patron or a Unilogin student.
export const isPatron = () => {
  return hasToken("user");
};

export const isUnregistered = () => {
  return hasToken("unregistered-user");
};

export const isBlocked = (patron: Patron) => {
  return !isEmpty(patron.blockStatus);
};

export const getUserToken = () => {
  if (isUnregistered()) {
    return getToken(TOKEN_UNREGISTERED_USER_KEY);
  }
  if (!isAnonymous()) {
    return getToken(TOKEN_USER_KEY);
  }
  return null;
};

export default {};
