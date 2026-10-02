// A Unilogin student is logged in to the CMS without being a patron, so there
// is no user token. The CMS hands over the student's uni-id instead, so the
// header can show who is logged in. It grants no access to anything.
let uniloginUserId: string | null = null;

export const setUniloginUserId = (id: string) => {
  uniloginUserId = id;
};

export const getUniloginUserId = () => uniloginUserId;

