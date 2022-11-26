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
const general_1 = __importStar(require("../lib/general"));
exports.default = (baseUri, options) => {
    // Search for "Harry Potter".
    // simpleGraphqlMapping("searchWithPagination");
    Promise.resolve().then(() => __importStar(require('./data/fbi/searchWithPagination.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "POST",
                urlPath: "/opac/graphql",
                "bodyPatterns": [{
                        "matchesJsonPath": (0, general_1.matchGraphqlQuery)("searchWithPagination")
                    }]
            },
            response: {
                jsonBody: json,
            },
        });
    });
    // Get intelligent facets.
    Promise.resolve().then(() => __importStar(require('./data/fbi/intelligentFacets.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "POST",
                urlPath: "/opac/graphql",
                "bodyPatterns": [{
                        "matchesJsonPath": (0, general_1.matchGraphqlQuery)("intelligentFacets")
                    }]
            },
            response: {
                jsonBody: json,
            },
        });
    });
    // Get searchFacets.
    Promise.resolve().then(() => __importStar(require('./data/fbi/searchFacet.json'))).then((json) => {
        (0, general_1.default)(baseUri, options).mappings.createMapping({
            request: {
                method: "POST",
                urlPath: "/opac/graphql",
                "bodyPatterns": [{
                        "matchesJsonPath": (0, general_1.matchGraphqlQuery)("searchFacet")
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
    (0, general_1.default)(baseUri, options).mappings.createMapping({
        request: {
            method: "HEAD",
            urlPath: "/list/default/.*",
        },
        response: {
            "status": 404
        },
    });
    // Get user-tokens.
    (0, general_1.default)(baseUri, options).mappings.createMapping({
        request: {
            method: "GET",
            urlPath: "/dpl-react/user-tokens",
        },
        response: {
            headers: {
                "Content-Type": "application/txt"
            },
            body: 'window.dplReact = window.dplReact || {};\nwindow.dplReact.setToken("library", "fcd5c29a171f97b626d71eceffe1313f00a284b0")',
        },
    });
    // Get campaign.
    (0, general_1.default)(baseUri, options).mappings.createMapping({
        request: {
            method: "GET",
            urlPath: "/dpl_campaign/match",
        },
        response: {
            "status": 404
        },
    });
    // Get availability.
    (0, general_1.default)(baseUri, options).mappings.createMapping({
        request: {
            method: "GET",
            urlPattern: "/external/agencyid/catalog/availability/v3\\?recordid=.*"
        },
        response: {
            "transformers": ["response-template"],
            jsonBody: [{
                    "recordId": "{{request.query.recordid}}",
                    "reservable": "{{pickRandom true false}}",
                    "available": "{{pickRandom true false}}",
                    "reservations": "{{randomInt lower=0 upper=10}}"
                }],
        },
    });
};
