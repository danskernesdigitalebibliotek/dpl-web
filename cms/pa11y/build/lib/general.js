"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.simpleGraphqlMapping = exports.wiremock = exports.matchGraphqlQuery = void 0;
const wiremock_rest_client_1 = require("wiremock-rest-client");
const matchGraphqlQuery = (id) => `$.[?(@.query =~ /.*query ${id}\(.*/s)]`;
exports.matchGraphqlQuery = matchGraphqlQuery;
const wiremock = (baseUri, options) => {
    return new wiremock_rest_client_1.WireMockRestClient("http://wiremock", options);
};
exports.wiremock = wiremock;
const simpleGraphqlMapping = (id) => {
    Promise.resolve().then(() => __importStar(require(`/data/${id}.json`))).then((json) => {
        (0, exports.wiremock)().mappings.createMapping({
            request: {
                method: "POST",
                urlPath: "/opac/graphql",
                "bodyPatterns": [{
                        "matchesJsonPath": (0, exports.matchGraphqlQuery)(id)
                    }]
            },
            response: {
                jsonBody: json,
            },
        });
    });
};
exports.simpleGraphqlMapping = simpleGraphqlMapping;
exports.default = exports.wiremock;
