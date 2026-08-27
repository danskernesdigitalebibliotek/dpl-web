const path = require("path");
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

// Force singleton instances of packages that hold React context. Workspace
// packages such as the service layer get their own node_modules, and resolving
// a second copy there gives it a separate QueryClientContext - the provider in
// this project then looks unset from inside the package. Mirrors the aliasing
// GO does for the same reason. Shared by webpack.config.js and
// .storybook/main.ts so the two builds cannot drift apart.
const singletonModules = ["react", "react-dom", "@tanstack/react-query"];

exports.singletonAliases = Object.fromEntries(
  singletonModules.map((m) => [m, path.resolve(__dirname, "node_modules", m)])
);
