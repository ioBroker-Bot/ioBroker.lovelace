import type { ioBrokerEntity, ServiceCallData } from './converter';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const adapterData = require('../../../lib/dataSingleton') as {
    adapter: ioBroker.Adapter;
    log: ioBroker.Logger;
    services: Record<string, unknown>;
};

/**
 * Seconds as `HH:MM:SS`, the way Home Assistant shows the remaining time.
 *
 * @param seconds - the remaining seconds
 * @returns the formatted time
 */
function formatSeconds(seconds: number): string {
    const sign = seconds < 0 ? '-' : '';
    const abs = Math.abs(Math.round(seconds));
    const hours = Math.floor(abs / 3600);
    const minutes = Math.floor((abs % 3600) / 60);
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${(abs % 60).toString().padStart(2, '0')}`;
}

/**
 * Seconds of a duration, in any of the shapes the frontend and Home Assistant use for one:
 * `{ hours, minutes, seconds }` (the duration input of the more-info dialog), `"HH:MM:SS"`
 * (a service call written by hand), or a plain number of seconds.
 *
 * @param duration - the duration to read
 * @returns the duration in seconds, or undefined when there is none
 */
export function durationToSeconds(duration: unknown): number | undefined {
    if (duration === undefined || duration === null || duration === '') {
        return undefined;
    }
    if (typeof duration === 'object') {
        const parts = duration as Record<string, number | string>;
        const seconds = Number(parts.hours || 0) * 3600 + Number(parts.minutes || 0) * 60 + Number(parts.seconds || 0);
        return isNaN(seconds) ? undefined : seconds;
    }
    const text = typeof duration === 'number' ? String(duration) : (duration as string);
    if (text.includes(':')) {
        const sign = text.trim().startsWith('-') ? -1 : 1;
        const parts = text.replace('-', '').split(':').map(Number);
        while (parts.length < 3) {
            parts.unshift(0); // "05:00" is five minutes, not five hours
        }
        if (parts.some(isNaN)) {
            return undefined;
        }
        return sign * (parts[0] * 3600 + parts[1] * 60 + parts[2]);
    }
    const seconds = Number(text);
    return isNaN(seconds) ? undefined : seconds;
}

/**
 * Write the remaining seconds back into the ioBroker state, in the shape that state uses.
 *
 * @param id - ioBroker state id of the timer
 * @param seconds - the remaining seconds to write
 * @param asText - true if the state holds `HH:MM:SS` instead of a number of seconds
 * @param user - user of the service call, for the permission check
 * @returns resolves when written
 */
async function writeRemaining(id: string, seconds: number, asText: boolean, user?: string): Promise<unknown> {
    const value = asText ? formatSeconds(Math.max(0, seconds)) : Math.max(0, Math.round(seconds));
    return adapterData.adapter.setForeignStateAsync(id, value, false, { user });
}

/**
 * The remaining seconds the ioBroker state currently holds.
 *
 * @param id - ioBroker state id of the timer
 * @returns the remaining seconds, 0 if the state is empty
 */
async function readRemaining(id: string): Promise<number> {
    const state = await adapterData.adapter.getForeignStateAsync(id);
    return durationToSeconds(state?.val ?? 0) ?? 0;
}

/**
 * Create a manual timer entity.
 *
 * A timer in Home Assistant is an entity of its own that counts down in the backend. We have no
 * such thing - the ioBroker state of some other adapter or script holds the remaining time, and we
 * derive idle / active / paused from how that value changes.
 *
 * @param id - ioBroker state id holding the remaining time (seconds or `HH:MM:SS`)
 * @param obj - the ioBroker object of that state
 * @param entity - already created entity (entity.context.STATE pre-set by the server)
 * @param _objects - ioBroker objects cache (unused)
 * @param _custom - custom settings of the ioBroker object (unused)
 * @returns array containing the augmented entity
 */
export function processManualEntity(
    id: string,
    obj: ioBroker.Object,
    entity: ioBrokerEntity,
    _objects?: Record<string, ioBroker.Object>,
    _custom?: Record<string, unknown>,
): ioBrokerEntity[] {
    const asText = (obj?.common?.type as string) === 'string';

    // - timer => STATE idle/paused/active, attributes: [remaining]
    entity.context.STATE = { getId: null, setId: null, attribute: 'state' as const }; // will be simulated
    entity.context.lastValue = null;
    entity.attributes.remaining = 0;
    entity.context.ATTRIBUTES = [
        {
            attribute: 'remaining',
            getId: id,
            setId: id,
            getParser: function (entity, attr, state) {
                state = state || { val: null };
                // if 0 => timer is off
                if (!state.val) {
                    entity.state = 'idle';
                } else if (entity.context.lastValue === null) {
                    entity.state = 'active';
                } else if (entity.context.lastValue === state.val) {
                    // pause
                    entity.state = 'paused';
                } else {
                    // active
                    entity.state = 'active';
                }

                entity.context.lastValue = state.val;

                // seconds to HH:MM:SS
                if (typeof state.val === 'string' && state.val.includes(':')) {
                    entity.attributes.remaining = state.val;
                } else {
                    entity.attributes.remaining = formatSeconds(parseInt(state.val as string, 10));
                }
            },
        },
    ];

    entity.context.COMMANDS = [
        {
            // The more-info dialog sends the duration of its duration input; without one Home
            // Assistant restarts the timer with its configured duration, which for us is whatever
            // the state still holds.
            service: 'start',
            setId: id,
            parseCommand: async (_ent, _command, data: ServiceCallData, user): Promise<unknown> => {
                const seconds = durationToSeconds(data.service_data.duration) ?? (await readRemaining(id));
                return writeRemaining(id, seconds, asText, user);
            },
        },
        {
            service: 'cancel',
            setId: id,
            parseCommand: async (_ent, _command, _data, user): Promise<unknown> => writeRemaining(id, 0, asText, user),
        },
        {
            // "Finish" ends the timer early, which for a countdown means it is over now.
            service: 'finish',
            setId: id,
            parseCommand: async (_ent, _command, _data, user): Promise<unknown> => writeRemaining(id, 0, asText, user),
        },
        {
            service: 'change',
            setId: id,
            parseCommand: async (_ent, _command, data: ServiceCallData, user): Promise<unknown> => {
                const delta = durationToSeconds(data.service_data.duration) ?? 0;
                return writeRemaining(id, (await readRemaining(id)) + delta, asText, user);
            },
        },
        {
            // Whoever counts the state down is out of our reach, so we cannot hold it. Say so
            // instead of leaving the button of the more-info dialog without an answer.
            service: 'pause',
            setId: id,
            parseCommand: (): Promise<unknown> =>
                Promise.reject(new Error('Pausing a timer is not possible, ioBroker counts it down.')),
        },
    ];

    entity.addID2entity(id);

    return [entity];
}

adapterData.services.timer = {
    start: {
        name: 'Start',
        description: 'Starts a timer or restarts it with a new duration.',
        fields: {
            duration: {
                example: '00:01:00',
                selector: { duration: null },
                name: 'Duration',
                description: 'Duration the timer requires to finish.',
            },
        },
        target: { entity: [{ domain: ['timer'] }] },
    },
    cancel: {
        name: 'Cancel',
        description: 'Resets a timer to its initial state.',
        fields: {},
        target: { entity: [{ domain: ['timer'] }] },
    },
    finish: {
        name: 'Finish',
        description: 'Finishes a running timer earlier than scheduled.',
        fields: {},
        target: { entity: [{ domain: ['timer'] }] },
    },
    change: {
        name: 'Change',
        description: 'Changes a timer by adding or subtracting a given duration.',
        fields: {
            duration: {
                required: true,
                example: '00:01:00',
                selector: { duration: { allow_negative: true } },
                name: 'Duration',
                description: 'Duration to add to or subtract from the running timer.',
            },
        },
        target: { entity: [{ domain: ['timer'] }] },
    },
};
