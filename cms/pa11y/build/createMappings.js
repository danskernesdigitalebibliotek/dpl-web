"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const general_1 = require("./lib/general");
const createMappingsForSearch_1 = __importDefault(require("./search/createMappingsForSearch"));
const create = async () => {
    await (0, general_1.wiremock)().mappings.deleteAllMappings();
    (0, createMappingsForSearch_1.default)();
};
create();
