/**
 * Base service descriptions, answered to `get_services`.
 *
 * This is only the seed. Every domain we actually execute brings its own description along and
 * overwrites its entry here (`adapterData.services.<domain> = {...}` at the bottom of the
 * converters, `augmentServices()` in the modules). So do not add a domain here that a converter or
 * module already describes - the entry would never be used.
 *
 * What is left here are the services the generic handlers of `_processSingleCall()` can execute on
 * any entity (turn_on / turn_off / toggle / press / trigger, set_value, select_option, *_say).
 * Anything else would only be offered to the user by the action picker of the frontend and then
 * answered with "Service not found".
 */
module.exports = {
    homeassistant: {
        turn_off: {
            name: 'Generic turn off',
            description: 'Generic action to turn devices off under any domain.',
            fields: {},
            target: {
                entity: [{}],
            },
        },
        turn_on: {
            name: 'Generic turn on',
            description: 'Generic action to turn devices on under any domain.',
            fields: {},
            target: {
                entity: [{}],
            },
        },
        toggle: {
            name: 'Generic toggle',
            description: 'Generic action to toggle devices on/off under any domain.',
            fields: {},
            target: {
                entity: [{}],
            },
        },
        update_entity: {
            name: 'Update entity',
            description: 'Forces one or more entities to update their data.',
            fields: {
                entity_id: {
                    required: true,
                    selector: {
                        entity: {
                            multiple: true,
                            reorder: false,
                        },
                    },
                    name: 'Entities to update',
                    description: 'List of entities to force update.',
                },
            },
        },
    },
    system_log: {
        write: {
            name: 'Write',
            description: 'Write log entry.',
            fields: {
                message: {
                    required: true,
                    example: 'Something went wrong',
                    selector: {
                        text: {},
                    },
                    name: 'Message',
                    description: 'Message to log.',
                },
                level: {
                    default: 'error',
                    selector: {
                        select: {
                            options: ['debug', 'info', 'warning', 'error', 'critical'],
                            translation_key: 'level',
                            custom_value: false,
                            sort: false,
                            multiple: false,
                        },
                    },
                    name: 'Level',
                    description: 'Log level.',
                },
                logger: {
                    example: 'mycomponent.myplatform',
                    selector: {
                        text: {},
                    },
                    name: 'Logger',
                    description: 'Logger name under which to log the message. Defaults to `system_log.external`.',
                },
            },
        },
    },
    tts: {
        google_translate_say: {
            name: 'Say a TTS message with google_translate',
            description: 'Say something using text-to-speech on a media player with google_translate.',
            fields: {
                entity_id: {
                    required: true,
                    selector: {
                        entity: {
                            domain: 'media_player',
                        },
                    },
                },
                message: {
                    example: 'My name is hanna',
                    required: true,
                    selector: {
                        text: null,
                    },
                },
                cache: {
                    default: false,
                    selector: {
                        boolean: null,
                    },
                },
                language: {
                    example: 'ru',
                    selector: {
                        text: null,
                    },
                },
                options: {
                    advanced: true,
                    example: 'platform specific',
                    selector: {
                        object: null,
                    },
                },
            },
        },
        cloud_say: {
            name: 'Say a TTS message with cloud',
            description: 'Say something using text-to-speech on a media player with cloud.',
            fields: {
                entity_id: {
                    required: true,
                    selector: {
                        entity: {
                            domain: 'media_player',
                        },
                    },
                },
                message: {
                    example: 'My name is hanna',
                    required: true,
                    selector: {
                        text: null,
                    },
                },
                cache: {
                    default: false,
                    selector: {
                        boolean: null,
                    },
                },
                language: {
                    example: 'ru',
                    selector: {
                        text: null,
                    },
                },
                options: {
                    advanced: true,
                    example: 'platform specific',
                    selector: {
                        object: null,
                    },
                },
            },
        },
    },
    scene: {
        turn_on: {
            name: 'Activate',
            description: 'Activates a scene.',
            fields: {
                transition: {
                    selector: {
                        number: {
                            min: 0,
                            max: 300,
                            unit_of_measurement: 'seconds',
                            step: 1,
                            mode: 'slider',
                        },
                    },
                    name: 'Transition',
                    description: 'Time it takes the devices to transition into the states defined in the scene.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['scene'],
                    },
                ],
            },
        },
    },
    input_button: {
        press: {
            name: 'Press',
            description: 'Mimics the physical button press on the device.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['input_button'],
                    },
                ],
            },
        },
    },
    automation: {
        trigger: {
            name: 'Trigger',
            description: 'Triggers the actions of an automation.',
            fields: {
                skip_condition: {
                    default: true,
                    selector: {
                        boolean: {},
                    },
                    name: 'Skip conditions',
                    description: 'Defines whether or not the conditions will be skipped.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['automation'],
                    },
                ],
            },
        },
        toggle: {
            name: 'Toggle',
            description: 'Toggles (enable / disable) an automation.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['automation'],
                    },
                ],
            },
        },
        turn_on: {
            name: 'Turn on',
            description: 'Enables an automation.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['automation'],
                    },
                ],
            },
        },
        turn_off: {
            name: 'Turn off',
            description: 'Disables an automation.',
            fields: {
                stop_actions: {
                    default: true,
                    selector: {
                        boolean: {},
                    },
                    name: 'Stop actions',
                    description: 'Stops currently running actions.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['automation'],
                    },
                ],
            },
        },
    },
    script: {
        turn_on: {
            name: 'Turn on',
            description: 'Runs the sequence of actions defined in a script.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['script'],
                    },
                ],
            },
        },
        turn_off: {
            name: 'Turn off',
            description: 'Stops a running script.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['script'],
                    },
                ],
            },
        },
        toggle: {
            name: 'Toggle',
            description: "Starts a script if it isn't running, stops it otherwise.",
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['script'],
                    },
                ],
            },
        },
    },
    input_boolean: {
        turn_on: {
            name: 'Turn on',
            description: 'Turns on the helper.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['input_boolean'],
                    },
                ],
            },
        },
        turn_off: {
            name: 'Turn off',
            description: 'Turns off the helper.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['input_boolean'],
                    },
                ],
            },
        },
        toggle: {
            name: 'Toggle',
            description: 'Toggles the helper on/off.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['input_boolean'],
                    },
                ],
            },
        },
    },
    input_number: {
        set_value: {
            name: 'Set',
            description: 'Sets the value.',
            fields: {
                value: {
                    required: true,
                    selector: {
                        number: {
                            min: 0,
                            max: 9223372036854776000,
                            step: 0.001,
                            mode: 'box',
                        },
                    },
                    name: 'Value',
                    description: 'The target value.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['input_number'],
                    },
                ],
            },
        },
    },
    input_text: {
        set_value: {
            name: 'Set',
            description: 'Sets the value.',
            fields: {
                value: {
                    required: true,
                    example: 'This is an example text',
                    selector: {
                        text: {},
                    },
                    name: 'Value',
                    description: 'The target value.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['input_text'],
                    },
                ],
            },
        },
    },
    number: {
        set_value: {
            name: 'Set',
            description: 'Sets the value of a number.',
            fields: {
                value: {
                    example: 42,
                    required: true,
                    selector: {
                        text: {},
                    },
                    name: 'Value',
                    description: 'The target value to set.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['number'],
                    },
                ],
            },
        },
    },
    select: {
        select_option: {
            name: 'Select',
            description: 'Selects an option.',
            fields: {
                option: {
                    required: true,
                    example: '"Item A"',
                    selector: {
                        text: {},
                    },
                    name: 'Option',
                    description: 'Option to be selected.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['select'],
                    },
                ],
            },
        },
    },
};
