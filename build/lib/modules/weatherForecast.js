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
var weatherForecast_exports = {};
__export(weatherForecast_exports, {
  FORECAST_FEATURES: () => FORECAST_FEATURES,
  default: () => weatherForecast_default,
  detectForecastType: () => detectForecastType,
  updateForecastFeature: () => updateForecastFeature
});
module.exports = __toCommonJS(weatherForecast_exports);
const WS_OPEN = 1;
const PUSH_DELAY_MS = 100;
const FORECAST_FEATURES = { daily: 1, hourly: 2, twice_daily: 4 };
function detectForecastType(forecast) {
  if (!Array.isArray(forecast) || forecast.length < 3) {
    return void 0;
  }
  const gap = new Date(forecast[2].datetime).getTime() - new Date(forecast[1].datetime).getTime();
  if (isNaN(gap) || gap <= 0) {
    return void 0;
  }
  if (gap < 8 * 36e5) {
    return "hourly";
  }
  return gap < 24 * 36e5 ? "twice_daily" : "daily";
}
function updateForecastFeature(entity) {
  var _a;
  if (!Array.isArray(entity.attributes.forecast)) {
    return;
  }
  const type = (_a = detectForecastType(entity.attributes.forecast)) != null ? _a : "daily";
  entity.attributes.supported_features = FORECAST_FEATURES[type];
}
class WeatherForecastModule {
  sendResponse;
  entityData;
  timers = /* @__PURE__ */ new Map();
  /**
   * Create the module.
   *
   * @param options - options object
   * @param options.sendResponse - send a WS result to a client
   * @param options.entityData - shared entity store
   */
  constructor(options) {
    this.sendResponse = options.sendResponse;
    this.entityData = options.entityData;
  }
  /**
   * The forecast of an entity in the shape the subscription delivers it.
   *
   * @param entityId - the weather entity
   * @param forecastType - the kind the frontend asked for
   * @returns the forecast event, with `forecast: null` when the entity has none of that kind
   */
  _forecastEvent(entityId, forecastType) {
    var _a, _b;
    const forecast = (_b = (_a = this.entityData.entityId2Entity[entityId]) == null ? void 0 : _a.attributes) == null ? void 0 : _b.forecast;
    if (!Array.isArray(forecast) || !forecast.length) {
      return { type: forecastType, forecast: null };
    }
    const actual = detectForecastType(forecast);
    if (actual && actual !== forecastType) {
      return { type: forecastType, forecast: null };
    }
    return { type: forecastType, forecast: forecast.filter((entry) => entry && typeof entry === "object") };
  }
  /**
   * Handle `weather/subscribe_forecast`: acknowledge, send the current forecast and keep the
   * subscription for updates.
   *
   * @param ws - websocket connection
   * @param message - the message from the frontend
   * @returns true if handled
   */
  processMessage(ws, message) {
    if (message.type !== "weather/subscribe_forecast") {
      return false;
    }
    const entityId = message.entity_id;
    const forecastType = message.forecast_type;
    const event = this._forecastEvent(entityId, forecastType);
    this.sendResponse(ws, message.id, null);
    ws.send(JSON.stringify({ id: message.id, type: "event", event }));
    ws.__forecastSubs = (ws.__forecastSubs || []).filter((sub) => sub.id !== message.id);
    ws.__forecastSubs.push({ id: message.id, entityId, forecastType, lastSent: JSON.stringify(event) });
    return true;
  }
  /**
   * Push the forecast of the weather entities a changed state belongs to. A forecast consists of
   * many states that usually change together, so the push waits a moment for the others.
   *
   * @param id - changed ioBroker state id
   * @param _state - new state (the entity is updated already)
   * @param wss - websocket server (to iterate clients)
   */
  onStateChange(id, _state, wss) {
    var _a;
    if (!wss) {
      return;
    }
    for (const entity of this.entityData.iobID2entity[id] || []) {
      if (!((_a = entity == null ? void 0 : entity.entity_id) == null ? void 0 : _a.startsWith("weather.")) || this.timers.has(entity.entity_id)) {
        continue;
      }
      const entityId = entity.entity_id;
      this.timers.set(
        entityId,
        setTimeout(() => {
          this.timers.delete(entityId);
          this._push(entityId, wss);
        }, PUSH_DELAY_MS)
      );
    }
  }
  /**
   * Send the forecast of an entity to every subscription on it, if it changed.
   *
   * @param entityId - the weather entity
   * @param wss - websocket server
   */
  _push(entityId, wss) {
    for (const client of wss.clients) {
      if (!client.__forecastSubs || client.readyState !== WS_OPEN) {
        continue;
      }
      for (const sub of client.__forecastSubs) {
        if (sub.entityId !== entityId) {
          continue;
        }
        const event = this._forecastEvent(entityId, sub.forecastType);
        const eventJson = JSON.stringify(event);
        if (eventJson === sub.lastSent) {
          continue;
        }
        sub.lastSent = eventJson;
        client.send(JSON.stringify({ id: sub.id, type: "event", event }));
      }
    }
  }
  /**
   * Remove a forecast subscription (called from unsubscribe_events).
   *
   * @param ws - websocket connection
   * @param subscriptionId - the subscription id to remove
   */
  removeSubscription(ws, subscriptionId) {
    if (ws.__forecastSubs) {
      ws.__forecastSubs = ws.__forecastSubs.filter((sub) => sub.id !== subscriptionId);
    }
  }
  /** Stop pending pushes. */
  cleanup() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
var weatherForecast_default = WeatherForecastModule;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  FORECAST_FEATURES,
  detectForecastType,
  updateForecastFeature
});
//# sourceMappingURL=weatherForecast.js.map
