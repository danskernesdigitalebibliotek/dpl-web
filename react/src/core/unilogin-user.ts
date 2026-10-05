// Logging in as a patron logs a Unilogin student out, so the student is asked
// first. The header menu, which is on every page, does the asking, and only
// registers to ask when the CMS says a Unilogin student is logged in.
type AskStudent = (proceed: () => void) => void;
let askStudent: AskStudent | null = null;

export const setAskStudentBeforePatronLogin = (ask: AskStudent | null) => {
  askStudent = ask;
};

export const requestPatronLogin = (proceed: () => void) => {
  if (askStudent) {
    askStudent(proceed);
    return;
  }
  proceed();
};
