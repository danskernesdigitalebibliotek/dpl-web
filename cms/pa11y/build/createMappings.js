"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commonMappings_1 = require("./lib/commonMappings");
const general_1 = require("./lib/general");
const createMappingsForSearch_1 = __importDefault(require("./search/createMappingsForSearch"));
const createMappingsForWorkPage_1 = __importDefault(require("./work/createMappingsForWorkPage"));
const create = async () => {
    await (0, general_1.wiremock)().mappings.deleteAllMappings();
    // Create common mappings.
    // Get cover.
    (0, commonMappings_1.coverMapping)();
    // Get material list.
    (0, commonMappings_1.materialListMapping)();
    // Get user-tokens.
    (0, commonMappings_1.userTokenMapping)();
    // Get availability.
    (0, commonMappings_1.availabilityMapping)();
    // Create page specific mappings.
    (0, createMappingsForSearch_1.default)();
    (0, createMappingsForWorkPage_1.default)();
};
create();
