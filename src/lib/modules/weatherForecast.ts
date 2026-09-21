const WS_OPEN = 1; // WebSocket.OPEN

/** How long to wait for the other states of a forecast before pushing an update. */
const PUSH_DELAY_MS = 100;

type SendResponseFn = (ws: unknown, id: unknown, result?: unknown) => void;

/** Forecast kinds of Home Assistant and their bits in `supported_features` (WeatherEntityFeature). */
export const FORECAST_FEATURES = { daily: 1, hourly: 2, twice_daily: 4 } as const;
export type ForecastType = keyof typeof FORECAST_FEATURES;

interface ForecastEntry {
    datetime?: unknown;
    [key: string]: unknown;
}

interface EntityLike {
    entity_id: string;
    attributes: Record<string, unknown>;
    context?: { type?: string };
}

interface EntityDataLike {
    entityId2Entity: Record<string, EntityLike>;
    iobID2entity: Record<string, EntityLike[] | undefined>;
}

interface ForecastSubscription {
    id: unknown;
    entityId: string;
    forecastType: string;
    /** Serialized forecast last pushed, to skip identical re-pushes. */
    lastSent: string;
}

interface WsWithForecast {
    send(data: string): void;
    readyState?: number;
    __forecastSubs?: ForecastSubscription[];
}

interface WsServerLike {
    clients: Iterable<WsWithForecast>;
}

/**
 * The kind of a forecast, judged by the time between its entries - the way the frontend does it for
 * a forecast attribute.
 *
 * @param forecast - the forecast entries
 * @returns the kind, or undefined when it cannot be told (too few entries, no usable dates)
 */
export function detectForecastType(forecast: ForecastEntry[] | undefined): ForecastType | undefined {
    if (!Array.isArray(forecast) || forecast.length < 3) {
        return undefined;
    }
    const gap = new Date(forecast[2].datetime as string).getTime() - new Date(forecast[1].datetime as string).getTime();
    if (isNaN(gap) || gap <= 0) {
        return undefined;
    }
    if (gap < 8 * 3600000) {
        return 'hourly';
    }
    return gap < 24 * 3600000 ? 'twice_daily' : 'daily';
}

/**
 * Set `supported_features` of a weather entity to the kind of forecast it has. The frontend offers
 * only those kinds in the card editor, and asks for the configured one.
 *
 * @param entity - the weather entity
 * @param entity.attributes - its attributes, holding the forecast
 */
export function updateForecastFeature(entity: { attributes: Record<string, unknown> }): void {
    if (!Array.isArray(entity.attributes.forecast)) {
        return;
    }
    const type = detectForecastType(entity.attributes.forecast as ForecastEntry[]) ?? 'daily';
    entity.attributes.supported_features = FORECAST_FEATURES[type];
}

/**
 * Weather forecasts for the Home Assistant frontend.
 *
 * Since Home Assistant 2024.3 a weather entity carries no forecast attribute any more; the frontend
 * subscribes with `weather/subscribe_forecast` instead. A card with a `forecast_type` - which every
 * card set up in the editor has - only uses that subscription and ignores the attribute. We still
 * collect the forecast into the attribute (the frontend reads it for cards without a type) and hand
 * the same data out through the subscription, updated whenever one of its states changes.
 */
class WeatherForecastModule {
    private sendResponse: SendResponseFn;
    private entityData: EntityDataLike;
    private timers = new Map<string, ReturnType<typeof setTimeout>>();

    /**
     * Create the module.
     *
     * @param options - options object
     * @param options.sendResponse - send a WS result to a client
     * @param options.entityData - shared entity store
     */
    constructor(options: { sendResponse: SendResponseFn; entityData: EntityDataLike }) {
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
    private _forecastEvent(entityId: string, forecastType: string): { type: string; forecast: ForecastEntry[] | null } {
        const forecast = this.entityData.entityId2Entity[entityId]?.attributes?.forecast as ForecastEntry[] | undefined;
        if (!Array.isArray(forecast) || !forecast.length) {
            return { type: forecastType, forecast: null };
        }
        // A forecast whose kind cannot be told is handed out as whatever was asked for, rather than
        // showing nothing.
        const actual = detectForecastType(forecast);
        if (actual && actual !== forecastType) {
            return { type: forecastType, forecast: null };
        }
        return { type: forecastType, forecast: forecast.filter(entry => entry && typeof entry === 'object') };
    }

    /**
     * Handle `weather/subscribe_forecast`: acknowledge, send the current forecast and keep the
     * subscription for updates.
     *
     * @param ws - websocket connection
     * @param message - the message from the frontend
     * @returns true if handled
     */
    processMessage(ws: WsWithForecast, message: Record<string, unknown>): boolean {
        if (message.type !== 'weather/subscribe_forecast') {
            return false;
        }
        const entityId = message.entity_id as string;
        const forecastType = message.forecast_type as string;
        const event = this._forecastEvent(entityId, forecastType);

        this.sendResponse(ws, message.id, null);
        ws.send(JSON.stringify({ id: message.id, type: 'event', event }));

        ws.__forecastSubs = (ws.__forecastSubs || []).filter(sub => sub.id !== message.id);
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
    onStateChange(id: string, _state: ioBroker.State | null | undefined, wss: WsServerLike | null | undefined): void {
        if (!wss) {
            return;
        }
        for (const entity of this.entityData.iobID2entity[id] || []) {
            if (!entity?.entity_id?.startsWith('weather.') || this.timers.has(entity.entity_id)) {
                continue;
            }
            const entityId = entity.entity_id;
            this.timers.set(
                entityId,
                setTimeout(() => {
                    this.timers.delete(entityId);
                    this._push(entityId, wss);
                }, PUSH_DELAY_MS),
            );
        }
    }

    /**
     * Send the forecast of an entity to every subscription on it, if it changed.
     *
     * @param entityId - the weather entity
     * @param wss - websocket server
     */
    private _push(entityId: string, wss: WsServerLike): void {
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
                client.send(JSON.stringify({ id: sub.id, type: 'event', event }));
            }
        }
    }

    /**
     * Remove a forecast subscription (called from unsubscribe_events).
     *
     * @param ws - websocket connection
     * @param subscriptionId - the subscription id to remove
     */
    removeSubscription(ws: WsWithForecast, subscriptionId: unknown): void {
        if (ws.__forecastSubs) {
            ws.__forecastSubs = ws.__forecastSubs.filter(sub => sub.id !== subscriptionId);
        }
    }

    /** Stop pending pushes. */
    cleanup(): void {
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        this.timers.clear();
    }
}

export default WeatherForecastModule;
