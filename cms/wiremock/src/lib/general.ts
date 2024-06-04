import { WireMockRestClient } from "wiremock-rest-client";
import { Options } from "wiremock-rest-client/dist/model/options.model";

export const matchGraphqlQuery = (id: string) =>
  `$.[?(@.query=~/.*query ${id}\\(.*/s)]`;

export const wiremock = (baseUri?: string, options?: Options) => {
  const wiremockEndpoint = process.env.HTTP_PROXY;
  if (!wiremockEndpoint) {
    throw new Error("HTTP_PROXY environment variable is not set");
  }
  return new WireMockRestClient(wiremockEndpoint, options);
};

export default wiremock;
