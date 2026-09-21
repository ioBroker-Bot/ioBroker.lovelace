"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var themesYaml_exports = {};
__export(themesYaml_exports, {
  parseThemes: () => parseThemes
});
module.exports = __toCommonJS(themesYaml_exports);
var import_js_yaml = require("js-yaml");
const SCHEMA = import_js_yaml.CORE_SCHEMA.withTags(import_js_yaml.mergeTag);
function parseThemes(text) {
  if (!text || !text.replace(/#.*$/gm, "").trim()) {
    return {};
  }
  const parsed = (0, import_js_yaml.load)(text, { schema: SCHEMA });
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  parseThemes
});
//# sourceMappingURL=themesYaml.js.map
