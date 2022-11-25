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
    Promise.resolve().then(() => __importStar(require('./data/searchWithPagination.json'))).then((json) => {
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
    Promise.resolve().then(() => __importStar(require('./data/intelligentFacets.json'))).then((json) => {
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
    Promise.resolve().then(() => __importStar(require('./data/searchFacet.json'))).then((json) => {
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
};
