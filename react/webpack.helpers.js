const dotenv = require("dotenv");

// react/.env is a symlink to the central root .env, which also holds server-side
// secrets for the CMS and Go (session secrets, Unilogin key material, …). Only a
// small allowlist of Storybook-relevant variables may be inlined into the browser
// bundle via DefinePlugin — never the whole file.
const isAllowedEnvVariable = (key) =>
  key.startsWith("STORYBOOK_") || key.endsWith("_BASEURL");

const getEnvVariables = () => {
  const parsed = dotenv.config().parsed;
  if (!parsed) return null;
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => isAllowedEnvVariable(key))
  );
};
const convertEnvVariablesToWebpack = (env) =>
  Object.keys(env).reduce(
    (prev, next) => ({
      ...prev,
      [`process.env.${next}`]: JSON.stringify(env[next])
    }),
    {}
  );

exports.getWebPackEnvVariables = () => {
  const variables = getEnvVariables();
  return variables ? convertEnvVariablesToWebpack(variables) : null;
};
