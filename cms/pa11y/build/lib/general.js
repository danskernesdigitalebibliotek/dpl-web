"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wiremock = exports.matchGraphqlQuery = void 0;
const wiremock_rest_client_1 = require("wiremock-rest-client");
const matchGraphqlQuery = (id) => `$.[?(@.query =~ /.*query ${id}\(.*/s)]`;
exports.matchGraphqlQuery = matchGraphqlQuery;
const wiremock = (baseUri, options) => {
    return new wiremock_rest_client_1.WireMockRestClient("http://wiremock", options);
};
exports.wiremock = wiremock;
exports.default = exports.wiremock;
