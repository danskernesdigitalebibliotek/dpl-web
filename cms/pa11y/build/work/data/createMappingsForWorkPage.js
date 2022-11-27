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
const commonMappings_1 = require("../../lib/commonMappings");
const general_1 = __importStar(require("../../lib/general"));
exports.default = (baseUri, options) => {
    // Get Work.
    Promise.resolve().then(() => __importStar(require('./data/fbi/getMaterial.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "POST",
                urlPath: "/opac/graphql",
                "bodyPatterns": [{
                        "matchesJsonPath": (0, general_1.matchGraphqlQuery)("getMaterial")
                    }]
            },
            response: {
                jsonBody: json,
            },
        });
    });
    // Get Infomedia.
    Promise.resolve().then(() => __importStar(require('./data/fbi/getInfomedia.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "POST",
                urlPath: "/opac/graphql",
                "bodyPatterns": [{
                        "matchesJsonPath": (0, general_1.matchGraphqlQuery)("getInfomedia")
                    }]
            },
            response: {
                jsonBody: json,
            },
        });
    });
    // Get covers.
    Promise.resolve().then(() => __importStar(require('./data/covers/covers.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "GET",
                urlPattern: "/api/v2/covers.*",
            },
            response: {
                jsonBody: json,
            },
        });
    });
    // Get material list.
    (0, commonMappings_1.materialListMapping)();
    // wiremock(baseUri, options).mappings.createMapping({
    //   request: {
    //     method: "HEAD",
    //     urlPath: "/list/default/.*",
    //   },
    //   response: {
    //     "status": 404
    //   },
    // });
    // Get user-tokens.
    (0, commonMappings_1.userTokenMapping)();
    // wiremock(baseUri, options).mappings.createMapping({
    //   request: {
    //     method: "GET",
    //     urlPath: "/dpl-react/user-tokens",
    //   },
    //   response: {
    //     headers: {
    //       "Content-Type": "application/txt"
    //     },
    //     body: 'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("library", "fcd5c29a171f97b626d71eceffe1313f00a284b0")',
    //   },
    // });
    // Get availability.
    (0, commonMappings_1.availabilityMapping)();
    // wiremock(baseUri, options).mappings.createMapping({
    //   request: {
    //     method: "GET",
    //     urlPattern: "/external/agencyid/catalog/availability/v3\\?recordid=.*"
    //   },
    //   response: {
    //     "transformers": ["response-template"],
    //     jsonBody: [{
    //       "recordId": "{{request.query.recordid}}",
    //       "reservable": "{{pickRandom true false}}",
    //       "available": "{{pickRandom true false}}",
    //       "reservations": "{{randomInt lower=0 upper=10}}"
    //     }],
    //   },
    // });
    // Get holdings.
    Promise.resolve().then(() => __importStar(require('./data/fbs/holdings.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "GET",
                urlPattern: "/external/agencyid/catalog/holdings/v3\\?recordid=.*"
            },
            response: {
                jsonBody: json,
            },
        });
    });
};
