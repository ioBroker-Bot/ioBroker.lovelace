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
var timer_exports = {};
__export(timer_exports, {
  durationToSeconds: () => durationToSeconds,
  processManualEntity: () => processManualEntity
});
module.exports = __toCommonJS(timer_exports);
const adapterData = require("../../../lib/dataSingleton");
function formatSeconds(seconds) {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(Math.round(seconds));
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor(abs % 3600 / 60);
  return `${sign}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${(abs % 60).toString().padStart(2, "0")}`;
}
function durationToSeconds(duration) {
  if (duration === void 0 || duration === null || duration === "") {
    return void 0;
  }
  if (typeof duration === "object") {
    const parts = duration;
    const seconds2 = Number(parts.hours || 0) * 3600 + Number(parts.minutes || 0) * 60 + Number(parts.seconds || 0);
    return isNaN(seconds2) ? void 0 : seconds2;
  }
  const text = typeof duration === "number" ? String(duration) : duration;
  if (text.includes(":")) {
    const sign = text.trim().startsWith("-") ? -1 : 1;
    const parts = text.replace("-", "").split(":").map(Number);
    while (parts.length < 3) {
      parts.unshift(0);
    }
    if (parts.some(isNaN)) {
      return void 0;
    }
    return sign * (parts[0] * 3600 + parts[1] * 60 + parts[2]);
  }
  const seconds = Number(text);
  return isNaN(seconds) ? void 0 : seconds;
}
async function writeRemaining(id, seconds, asText, user) {
  const value = asText ? formatSeconds(Math.max(0, seconds)) : Math.max(0, Math.round(seconds));
  return adapterData.adapter.setForeignStateAsync(id, value, false, { user });
}
async function readRemaining(id) {
  var _a, _b;
  const state = await adapterData.adapter.getForeignStateAsync(id);
  return (_b = durationToSeconds((_a = state == null ? void 0 : state.val) != null ? _a : 0)) != null ? _b : 0;
}
function processManualEntity(id, obj, entity, _objects, _custom) {
  var _a;
  const asText = ((_a = obj == null ? void 0 : obj.common) == null ? void 0 : _a.type) === "string";
  entity.context.STATE = { getId: null, setId: null, attribute: "state" };
  entity.context.lastValue = null;
  entity.attributes.remaining = 0;
  entity.context.ATTRIBUTES = [
    {
      attribute: "remaining",
      getId: id,
      setId: id,
      getParser: function(entity2, attr, state) {
        state = state || { val: null };
        if (!state.val) {
          entity2.state = "idle";
        } else if (entity2.context.lastValue === null) {
          entity2.state = "active";
        } else if (entity2.context.lastValue === state.val) {
          entity2.state = "paused";
        } else {
          entity2.state = "active";
        }
        entity2.context.lastValue = state.val;
        if (typeof state.val === "string" && state.val.includes(":")) {
          entity2.attributes.remaining = state.val;
        } else {
          entity2.attributes.remaining = formatSeconds(parseInt(state.val, 10));
        }
      }
    }
  ];
  entity.context.COMMANDS = [
    {
      // The more-info dialog sends the duration of its duration input; without one Home
      // Assistant restarts the timer with its configured duration, which for us is whatever
      // the state still holds.
      service: "start",
      setId: id,
      parseCommand: async (_ent, _command, data, user) => {
        var _a2;
        const seconds = (_a2 = durationToSeconds(data.service_data.duration)) != null ? _a2 : await readRemaining(id);
        return writeRemaining(id, seconds, asText, user);
      }
    },
    {
      service: "cancel",
      setId: id,
      parseCommand: async (_ent, _command, _data, user) => writeRemaining(id, 0, asText, user)
    },
    {
      // "Finish" ends the timer early, which for a countdown means it is over now.
      service: "finish",
      setId: id,
      parseCommand: async (_ent, _command, _data, user) => writeRemaining(id, 0, asText, user)
    },
    {
      service: "change",
      setId: id,
      parseCommand: async (_ent, _command, data, user) => {
        var _a2;
        const delta = (_a2 = durationToSeconds(data.service_data.duration)) != null ? _a2 : 0;
        return writeRemaining(id, await readRemaining(id) + delta, asText, user);
      }
    },
    {
      // Whoever counts the state down is out of our reach, so we cannot hold it. Say so
      // instead of leaving the button of the more-info dialog without an answer.
      service: "pause",
      setId: id,
      parseCommand: () => Promise.reject(new Error("Pausing a timer is not possible, ioBroker counts it down."))
    }
  ];
  entity.addID2entity(id);
  return [entity];
}
adapterData.services.timer = {
  start: {
    name: "Start",
    description: "Starts a timer or restarts it with a new duration.",
    fields: {
      duration: {
        example: "00:01:00",
        selector: { duration: null },
        name: "Duration",
        description: "Duration the timer requires to finish."
      }
    },
    target: { entity: [{ domain: ["timer"] }] }
  },
  cancel: {
    name: "Cancel",
    description: "Resets a timer to its initial state.",
    fields: {},
    target: { entity: [{ domain: ["timer"] }] }
  },
  finish: {
    name: "Finish",
    description: "Finishes a running timer earlier than scheduled.",
    fields: {},
    target: { entity: [{ domain: ["timer"] }] }
  },
  change: {
    name: "Change",
    description: "Changes a timer by adding or subtracting a given duration.",
    fields: {
      duration: {
        required: true,
        example: "00:01:00",
        selector: { duration: { allow_negative: true } },
        name: "Duration",
        description: "Duration to add to or subtract from the running timer."
      }
    },
    target: { entity: [{ domain: ["timer"] }] }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  durationToSeconds,
  processManualEntity
});
//# sourceMappingURL=timer.js.map
