"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.availabilityMapping = exports.userTokenMapping = exports.materialListMapping = exports.coverMapping = void 0;
const general_1 = __importDefault(require("../lib/general"));
const coverMapping = (baseUri, options) => {
    (0, general_1.default)(baseUri, options).mappings.createMapping({
        request: {
            method: "GET",
            urlPattern: "/api/v2/covers.*",
        },
        response: {
            jsonBody: [
                {
                    "id": "870970-basis:134693959",
                    "type": "pid",
                    "imageUrls": {
                        "small": {
                            "url": "https://res.cloudinary.com/dandigbib/image/upload/t_ddb_cover_small/v1647612411/bogportalen.dk/9788702307566.jpg",
                            "format": "jpeg",
                            "size": "small"
                        }
                    }
                }
            ]
        }
    });
};
exports.coverMapping = coverMapping;
const materialListMapping = (baseUri, options) => {
    (0, general_1.default)(baseUri, options).mappings.createMapping({
        request: {
            method: "HEAD",
            urlPath: "/list/default/.*",
        },
        response: {
            "status": 404
        },
    });
};
exports.materialListMapping = materialListMapping;
const userTokenMapping = (baseUri, options) => {
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
};
exports.userTokenMapping = userTokenMapping;
const availabilityMapping = (baseUri, options) => {
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
exports.availabilityMapping = availabilityMapping;
