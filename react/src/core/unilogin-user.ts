// A Unilogin student is logged in to the CMS without being a patron, so there
// is no user token. The CMS hands over the student's uni-id instead, so the
// header can show who is logged in. It grants no access to anything.
let uniloginUserId: string | null = null;

export const setUniloginUserId = (id: string) => {
  uniloginUserId = id;
};

export const getUniloginUserId = () => uniloginUserId;

// Logging in as a patron logs a Unilogin student out, so the student is asked
// first. The header menu, which is on every page, does the asking.
type AskStudent = (proceed: () => void) => void;
let askStudent: AskStudent | null = null;

export const setAskStudentBeforePatronLogin = (ask: AskStudent | null) => {
  askStudent = ask;
};

export const requestPatronLogin = (proceed: () => void) => {
  if (uniloginUserId && askStudent) {
    askStudent(proceed);
    return;
  }
  proceed();
};
