/**
 * Base service descriptions, answered to `get_services`.
 *
 * This is only the seed. Every domain we actually execute brings its own description along and
 * overwrites its entry here (`adapterData.services.<domain> = {...}` at the bottom of the
 * converters, `augmentServices()` in the modules). So do not add a domain here that a converter or
 * module already describes - the entry would never be used.
 */
module.exports = {
    homeassistant: {
        save_persistent_states: {
            name: 'Save persistent states',
            description: 'Saves the persistent states immediately. Maintains the normal periodic saving interval.',
            fields: {},
        },
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
        stop: {
            name: 'Stop',
            description: 'Stops Home Assistant.',
            fields: {},
        },
        restart: {
            name: 'Restart',
            description: 'Restarts Home Assistant.',
            fields: {},
        },
        check_config: {
            name: 'Check configuration',
            description:
                'Checks the Home Assistant YAML-configuration files for errors. Errors will be shown in the Home Assistant logs.',
            fields: {},
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
        reload_core_config: {
            name: 'Reload Core configuration',
            description: 'Reloads the Core configuration from the YAML-configuration.',
            fields: {},
        },
        set_location: {
            name: 'Set location',
            description: 'Updates the Home Assistant location.',
            fields: {
                latitude: {
                    required: true,
                    example: 32.87336,
                    selector: {
                        number: {
                            mode: 'box',
                            min: -90,
                            max: 90,
                            step: 'any',
                        },
                    },
                    name: 'Latitude',
                    description: 'Latitude of your location.',
                },
                longitude: {
                    required: true,
                    example: 117.22743,
                    selector: {
                        number: {
                            mode: 'box',
                            min: -180,
                            max: 180,
                            step: 'any',
                        },
                    },
                    name: 'Longitude',
                    description: 'Longitude of your location.',
                },
                elevation: {
                    required: false,
                    example: 120,
                    selector: {
                        number: {
                            mode: 'box',
                            step: 'any',
                        },
                    },
                    name: 'Elevation',
                    description: 'Elevation of your location above sea level.',
                },
            },
        },
        reload_custom_templates: {
            name: 'Reload custom Jinja2 templates',
            description:
                'Reloads Jinja2 templates found in the `custom_templates` folder in your config. New values will be applied on the next render of the template.',
            fields: {},
        },
        reload_config_entry: {
            name: 'Reload config entry',
            description: 'Reloads the specified config entry.',
            fields: {
                entry_id: {
                    advanced: true,
                    required: false,
                    example: '8955375327824e14ba89e4b29cc3ec9a',
                    selector: {
                        config_entry: {},
                    },
                    name: 'Config entry ID',
                    description: 'The configuration entry ID of the entry to be reloaded.',
                },
            },
            target: {
                entity: [{}],
                device: [{}],
            },
        },
        reload_all: {
            name: 'Reload all',
            description: 'Reloads all YAML configuration that can be reloaded without restarting Home Assistant.',
            fields: {},
        },
    },
    logger: {
        set_default_level: {
            name: 'Set default level',
            description: 'Sets the default log level for integrations.',
            fields: {
                level: {
                    selector: {
                        select: {
                            options: ['debug', 'info', 'warning', 'error', 'fatal', 'critical'],
                            translation_key: 'level',
                            custom_value: false,
                            sort: false,
                            multiple: false,
                        },
                    },
                    name: 'Level',
                    description: 'Default severity level for all integrations.',
                },
            },
        },
        set_level: {
            name: 'Set level',
            description: 'Sets the log level for one or more integrations.',
            fields: {},
        },
    },
    system_log: {
        clear: {
            name: 'Clear',
            description: 'Deletes all log entries.',
            fields: {},
        },
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
    frontend: {
        set_theme: {
            name: 'Set the default theme',
            description: 'Sets the default theme Home Assistant uses. Can be overridden by a user.',
            fields: {
                name: {
                    required: true,
                    example: 'default',
                    selector: {
                        theme: {
                            include_default: true,
                        },
                    },
                    name: 'Theme',
                    description: 'Name of a theme.',
                },
                mode: {
                    default: 'light',
                    selector: {
                        select: {
                            options: ['dark', 'light'],
                            translation_key: 'mode',
                            custom_value: false,
                            sort: false,
                            multiple: false,
                        },
                    },
                    name: 'Mode',
                    description: 'Theme mode.',
                },
            },
        },
        reload_themes: {
            name: 'Reload themes',
            description: 'Reloads themes from the YAML-configuration.',
            fields: {},
        },
    },
    recorder: {
        purge: {
            name: 'Purge',
            description: 'Starts purge task - to clean up old data from your database.',
            fields: {
                keep_days: {
                    selector: {
                        number: {
                            min: 0,
                            max: 365,
                            unit_of_measurement: 'days',
                            step: 1,
                            mode: 'slider',
                        },
                    },
                    name: 'Days to keep',
                    description:
                        'Number of days to keep the data in the database. Starting today, counting backward. A value of `7` means that everything older than a week will be purged.',
                },
                repack: {
                    default: false,
                    selector: {
                        boolean: {},
                    },
                    name: 'Repack',
                    description: 'Attempt to save disk space by rewriting the entire database file.',
                },
                apply_filter: {
                    default: false,
                    selector: {
                        boolean: {},
                    },
                    name: 'Apply filter',
                    description: 'Apply `entity_id` and `event_type` filters in addition to time-based purge.',
                },
            },
        },
        purge_entities: {
            name: 'Purge entities',
            description: 'Starts a purge task to remove the data related to specific entities from your database.',
            fields: {
                entity_id: {
                    required: false,
                    selector: {
                        entity: {
                            multiple: true,
                            reorder: false,
                        },
                    },
                    name: 'Entities to remove',
                    description: 'List of entities for which the data is to be removed from the Recorder database.',
                },
                domains: {
                    example: 'sun',
                    required: false,
                    selector: {
                        object: {},
                    },
                    name: 'Domains to remove',
                    description: 'List of domains for which the data needs to be removed from the Recorder database.',
                },
                entity_globs: {
                    example: 'domain*.object_id*',
                    required: false,
                    selector: {
                        object: {},
                    },
                    name: 'Entity globs to remove',
                    description:
                        'List of glob patterns used to select the entities for which the data is to be removed from the Recorder database.',
                },
                keep_days: {
                    default: 0,
                    selector: {
                        number: {
                            min: 0,
                            max: 365,
                            unit_of_measurement: 'days',
                            step: 1,
                            mode: 'slider',
                        },
                    },
                    name: 'Days to keep',
                    description:
                        'Number of days to keep the data for rows matching the filter. Starting today, counting backward. A value of `7` means that everything older than a week will be purged. The default of 0 days will remove all matching rows immediately.',
                },
            },
        },
        enable: {
            name: 'Enable',
            description: 'Starts the recording of events and state changes.',
            fields: {},
        },
        disable: {
            name: 'Disable',
            description: 'Stops the recording of events and state changes.',
            fields: {},
        },
        get_statistics: {
            name: 'Get statistics',
            description: 'Retrieves statistics data for entities within a specific time period.',
            fields: {
                start_time: {
                    required: true,
                    example: '2025-01-01 00:00:00',
                    selector: {
                        datetime: {},
                    },
                    name: 'Start time',
                    description: 'The start time for the statistics query.',
                },
                end_time: {
                    required: false,
                    example: '2025-01-02 00:00:00',
                    selector: {
                        datetime: {},
                    },
                    name: 'End time',
                    description:
                        'The end time for the statistics query. If omitted, returns all statistics from start time onward.',
                },
                statistic_ids: {
                    required: true,
                    example: ['sensor.energy_consumption', 'sensor.temperature'],
                    selector: {
                        statistic: {
                            multiple: true,
                        },
                    },
                    name: 'Statistic IDs',
                    description: 'The entity IDs or statistic IDs to return statistics for.',
                },
                period: {
                    required: true,
                    example: 'hour',
                    selector: {
                        select: {
                            options: ['5minute', 'hour', 'day', 'week', 'month'],
                            custom_value: false,
                            sort: false,
                            multiple: false,
                        },
                    },
                    name: 'Period',
                    description: 'The time period to group statistics by.',
                },
                types: {
                    required: true,
                    example: ['mean', 'sum'],
                    selector: {
                        select: {
                            options: ['change', 'last_reset', 'max', 'mean', 'min', 'state', 'sum'],
                            multiple: true,
                            custom_value: false,
                            sort: false,
                        },
                    },
                    name: 'Types',
                    description: 'The types of statistics values to return.',
                },
                units: {
                    required: false,
                    example: {
                        energy: 'kWh',
                        temperature: '°C',
                    },
                    selector: {
                        object: {},
                    },
                    name: 'Units',
                    description: 'Optional unit conversion mapping.',
                },
            },
            response: {
                optional: false,
            },
        },
    },
    backup: {
        create: {
            name: 'Create backup',
            description: 'Creates a new backup.',
            fields: {},
        },
        create_automatic: {
            name: 'Create automatic backup',
            description: 'Creates a new backup with automatic backup settings.',
            fields: {},
        },
    },
    ffmpeg: {
        start: {
            name: 'Start',
            description: 'Sends a start command to an FFmpeg-based sensor.',
            fields: {
                entity_id: {
                    selector: {
                        entity: {
                            integration: 'ffmpeg',
                            domain: ['binary_sensor'],
                            multiple: false,
                            reorder: false,
                        },
                    },
                    name: 'Entity',
                    description: 'Name of entity that will start. Platform dependent.',
                },
            },
        },
        stop: {
            name: 'Stop',
            description: 'Sends a stop command to an FFmpeg-based sensor.',
            fields: {
                entity_id: {
                    selector: {
                        entity: {
                            integration: 'ffmpeg',
                            domain: ['binary_sensor'],
                            multiple: false,
                            reorder: false,
                        },
                    },
                    name: 'Entity',
                    description: 'Name of entity that will stop. Platform dependent.',
                },
            },
        },
        restart: {
            name: 'Restart',
            description: 'Sends a restart command to an FFmpeg-based sensor.',
            fields: {
                entity_id: {
                    selector: {
                        entity: {
                            integration: 'ffmpeg',
                            domain: ['binary_sensor'],
                            multiple: false,
                            reorder: false,
                        },
                    },
                    name: 'Entity',
                    description: 'Name of entity that will restart. Platform dependent.',
                },
            },
        },
    },
    tts: {
        speak: {
            name: 'Speak',
            description: 'Speaks something using text-to-speech on a media player.',
            fields: {
                media_player_entity_id: {
                    required: true,
                    selector: {
                        entity: {
                            domain: ['media_player'],
                            multiple: false,
                            reorder: false,
                        },
                    },
                    name: 'Media player entity',
                    description: 'Media players to play the message.',
                },
                message: {
                    example: 'My name is hanna',
                    required: true,
                    selector: {
                        text: {},
                    },
                    name: 'Message',
                    description:
                        'The text you want to convert into speech so that you can listen to it on your device.',
                },
                cache: {
                    default: true,
                    selector: {
                        boolean: {},
                    },
                    name: 'Cache',
                    description:
                        'Stores this message locally so that when the text is requested again, the output can be produced more quickly.',
                },
                language: {
                    example: 'ru',
                    selector: {
                        text: {},
                    },
                    name: 'Language',
                    description: 'Language to use for speech generation.',
                },
                options: {
                    advanced: true,
                    example: 'platform specific',
                    selector: {
                        object: {},
                    },
                    name: 'Options',
                    description: 'A dictionary containing integration-specific options.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['tts'],
                    },
                ],
            },
        },
        clear_cache: {
            name: 'Clear TTS cache',
            description: 'Removes all cached text-to-speech files and purges the memory.',
            fields: {},
        },
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
    cloud: {
        remote_connect: {
            name: 'Enable remote access',
            description:
                'Makes the instance UI accessible from outside of the local network by enabling your Home Assistant Cloud connection.',
            fields: {},
        },
        remote_disconnect: {
            name: 'Disable remote access',
            description:
                'Disconnects the instance UI from Home Assistant Cloud. This disables access to it from outside your local network.',
            fields: {},
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
        reload: {
            name: 'Reload',
            description: 'Reloads the scenes from the YAML-configuration.',
            fields: {},
        },
        apply: {
            name: 'Apply',
            description: 'Activates a scene with configuration.',
            fields: {
                entities: {
                    required: true,
                    example: 'light.kitchen: "on"\nlight.ceiling:\n  state: "on"\n  brightness: 80\n',
                    selector: {
                        object: {},
                    },
                    name: 'Entities state',
                    description: 'List of entities and their target state.',
                },
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
        },
        create: {
            name: 'Create',
            description: 'Creates a new scene.',
            fields: {
                scene_id: {
                    required: true,
                    example: 'all_lights',
                    selector: {
                        text: {},
                    },
                    name: 'Scene entity ID',
                    description: 'The entity ID of the new scene.',
                },
                entities: {
                    advanced: true,
                    example: 'light.tv_back_light: "on"\nlight.ceiling:\n  state: "on"\n  brightness: 200\n',
                    selector: {
                        object: {},
                    },
                    name: 'Entity states',
                    description:
                        "List of entities and their target state. If your entities are already in the target state right now, use 'Entities snapshot' instead.",
                },
                snapshot_entities: {
                    example: '- light.ceiling\n- light.kitchen\n',
                    selector: {
                        entity: {
                            multiple: true,
                            reorder: false,
                        },
                    },
                    name: 'Entities snapshot',
                    description:
                        "List of entities to be included in the snapshot. By taking a snapshot, you record the current state of those entities. If you do not want to use the current state of all your entities for this scene, you can combine 'Entities snapshot' with 'Entity states'.",
                },
            },
        },
        delete: {
            name: 'Delete',
            description: 'Deletes a dynamically created scene.',
            fields: {},
            target: {
                entity: [
                    {
                        integration: 'homeassistant',
                        domain: ['scene'],
                    },
                ],
            },
        },
    },
    zone: {
        reload: {
            name: 'Reload',
            description: 'Reloads zones from the YAML-configuration.',
            fields: {},
        },
    },
    logbook: {
        log: {
            name: 'Log',
            description: 'Creates a custom entry in the logbook.',
            fields: {
                name: {
                    required: true,
                    example: 'Kitchen',
                    selector: {
                        text: {},
                    },
                    name: 'Name',
                    description: "Custom name for an entity, can be referenced using the 'Entity ID' field.",
                },
                message: {
                    required: true,
                    example: 'is being used',
                    selector: {
                        text: {},
                    },
                    name: 'Message',
                    description: 'Message of the logbook entry.',
                },
                entity_id: {
                    selector: {
                        entity: {},
                    },
                    name: 'Entity ID',
                    description: 'Entity to reference in the logbook entry.',
                },
                domain: {
                    example: 'light',
                    selector: {
                        text: {},
                    },
                    name: 'Domain',
                    description:
                        'Determines which icon is used in the logbook entry. The icon illustrates the integration domain related to this logbook entry.',
                },
            },
        },
    },
    timer: {
        reload: {
            name: 'Reload',
            description: 'Reloads timers from the YAML-configuration.',
            fields: {},
        },
        start: {
            name: 'Start',
            description: 'Starts a timer or restarts it with a provided duration.',
            fields: {
                duration: {
                    example: '00:01:00 or 60',
                    selector: {
                        text: {},
                    },
                    name: 'Duration',
                    description: 'Custom duration to restart the timer with.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['timer'],
                    },
                ],
            },
        },
        pause: {
            name: 'Pause',
            description: 'Pauses a running timer, retaining the remaining duration for later continuation.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['timer'],
                    },
                ],
            },
        },
        cancel: {
            name: 'Cancel',
            description:
                "Resets a timer's duration to the last known initial value without firing the timer finished event.",
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['timer'],
                    },
                ],
            },
        },
        finish: {
            name: 'Finish',
            description: 'Finishes a running timer earlier than scheduled.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['timer'],
                    },
                ],
            },
        },
        change: {
            name: 'Change',
            description: 'Changes a timer by adding or subtracting a given duration.',
            fields: {
                duration: {
                    default: 0,
                    required: true,
                    example: '00:01:00, 60 or -60',
                    selector: {
                        text: {},
                    },
                    name: 'Duration',
                    description: 'Duration to add to or subtract from the running timer.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['timer'],
                    },
                ],
            },
        },
    },
    input_button: {
        reload: {
            name: 'Reload',
            description: 'Reloads helpers from the YAML-configuration.',
            fields: {},
        },
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
        reload: {
            name: 'Reload',
            description: 'Reloads the automation configuration.',
            fields: {},
        },
    },
    script: {
        reload: {
            name: 'Reload',
            description: 'Reloads all the available scripts.',
            fields: {},
        },
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
        reload: {
            name: 'Reload',
            description: 'Reloads helpers from the YAML-configuration.',
            fields: {},
        },
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
    person: {
        reload: {
            name: 'Reload',
            description: 'Reloads persons from the YAML-configuration.',
            fields: {},
        },
    },
    input_number: {
        reload: {
            name: 'Reload',
            description: 'Reloads helpers from the YAML-configuration.',
            fields: {},
        },
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
        increment: {
            name: 'Increment',
            description: 'Increments the current value by 1 step.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['input_number'],
                    },
                ],
            },
        },
        decrement: {
            name: 'Decrement',
            description: 'Decrements the current value by 1 step.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['input_number'],
                    },
                ],
            },
        },
    },
    schedule: {
        reload: {
            name: 'Reload',
            description: 'Reloads schedules from the YAML-configuration.',
            fields: {},
        },
        get_schedule: {
            name: 'Get schedule',
            description: 'Retrieves the configured time ranges of one or multiple schedules.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['schedule'],
                    },
                ],
            },
            response: {
                optional: false,
            },
        },
    },
    mqtt: {
        publish: {
            name: 'Publish',
            description: 'Publishes a message to an MQTT topic.',
            fields: {
                topic: {
                    required: true,
                    example: '/homeassistant/hello',
                    selector: {
                        text: {},
                    },
                    name: 'Topic',
                    description: 'Topic to publish to.',
                },
                payload: {
                    example: "The temperature is {{ states('sensor.temperature') }}",
                    selector: {
                        template: {},
                    },
                    name: 'Payload',
                    description: 'The payload to publish. Publishes an empty message if not provided.',
                },
                evaluate_payload: {
                    advanced: true,
                    default: false,
                    selector: {
                        boolean: {},
                    },
                    name: 'Evaluate payload',
                    description:
                        "If 'Payload' is a Python bytes literal, evaluate the bytes literal and publish the raw data.",
                },
                qos: {
                    advanced: true,
                    default: 0,
                    selector: {
                        select: {
                            options: ['0', '1', '2'],
                            custom_value: false,
                            sort: false,
                            multiple: false,
                        },
                    },
                    name: 'QoS',
                    description: 'Quality of Service to use. 0: At most once. 1: At least once. 2: Exactly once.',
                },
                retain: {
                    default: false,
                    selector: {
                        boolean: {},
                    },
                    name: 'Retain',
                    description:
                        'If the message should have the retain flag set. If set, the broker stores the most recent message on a topic.',
                },
            },
        },
        dump: {
            name: 'Export',
            description:
                'Writes all messages on a specific topic into the `mqtt_dump.txt` file in your configuration folder.',
            fields: {
                topic: {
                    example: 'OpenZWave/#',
                    selector: {
                        text: {},
                    },
                    name: 'Topic',
                    description: 'Topic to listen to.',
                },
                duration: {
                    default: 5,
                    selector: {
                        number: {
                            min: 1,
                            max: 300,
                            unit_of_measurement: 'seconds',
                            step: 1,
                            mode: 'slider',
                        },
                    },
                    name: 'Duration',
                    description: 'How long we should listen for messages in seconds.',
                },
            },
        },
        reload: {
            name: 'Reload',
            description: 'Reloads MQTT entities from the YAML-configuration.',
            fields: {},
        },
    },
    input_text: {
        reload: {
            name: 'Reload',
            description: 'Reloads helpers from the YAML-configuration.',
            fields: {},
        },
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
    counter: {
        increment: {
            name: 'Increment',
            description: 'Increments a counter by its step size.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['counter'],
                    },
                ],
            },
        },
        decrement: {
            name: 'Decrement',
            description: 'Decrements a counter by its step size.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['counter'],
                    },
                ],
            },
        },
        reset: {
            name: 'Reset',
            description: 'Resets a counter to its initial value.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['counter'],
                    },
                ],
            },
        },
        set_value: {
            name: 'Set',
            description: 'Sets the counter to a specific value.',
            fields: {
                value: {
                    required: true,
                    selector: {
                        number: {
                            min: 0,
                            max: 9223372036854776000,
                            mode: 'box',
                            step: 1,
                        },
                    },
                    name: 'Value',
                    description: 'The new counter value the entity should be set to.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['counter'],
                    },
                ],
            },
        },
    },
    notify: {
        send_message: {
            name: 'Send a notification message',
            description: 'Sends a notification message.',
            fields: {
                message: {
                    required: true,
                    selector: {
                        text: {},
                    },
                    name: 'Message',
                    description: 'Your notification message.',
                },
                title: {
                    required: false,
                    selector: {
                        text: {},
                    },
                    filter: {
                        supported_features: [1],
                    },
                    name: 'Title',
                    description: 'Title for your notification message.',
                },
            },
            target: {
                entity: [
                    {
                        domain: ['notify'],
                    },
                ],
            },
        },
        persistent_notification: {
            name: 'Send a persistent notification',
            description: 'Sends a notification that is visible in the notifications panel.',
            fields: {
                message: {
                    required: true,
                    example: 'The garage door has been open for 10 minutes.',
                    selector: {
                        text: {},
                    },
                    name: 'Message',
                    description: 'Message body of the notification.',
                },
                title: {
                    example: 'Your Garage Door Friend',
                    selector: {
                        text: {},
                    },
                    name: 'Title',
                    description: 'Title of the notification.',
                },
                data: {
                    example: 'platform specific',
                    selector: {
                        object: {},
                    },
                    name: 'Data',
                    description:
                        'Some integrations provide extended functionality via this field. For more information, refer to the integration documentation.',
                },
            },
        },
        notify: {
            name: 'Send a notification with notify',
            description: 'Sends a notification message using the notify service.',
            fields: {
                message: {
                    required: true,
                    example: 'The garage door has been open for 10 minutes.',
                    selector: {
                        text: null,
                    },
                },
                title: {
                    example: 'Your Garage Door Friend',
                    selector: {
                        text: null,
                    },
                },
                target: {
                    example: 'platform specific',
                    selector: {
                        object: null,
                    },
                },
                data: {
                    example: 'platform specific',
                    selector: {
                        object: null,
                    },
                },
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
        select_first: {
            name: 'First',
            description: 'Selects the first option.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['select'],
                    },
                ],
            },
        },
        select_last: {
            name: 'Last',
            description: 'Selects the last option.',
            fields: {},
            target: {
                entity: [
                    {
                        domain: ['select'],
                    },
                ],
            },
        },
        select_next: {
            name: 'Next',
            description: 'Selects the next option.',
            fields: {
                cycle: {
                    default: true,
                    selector: {
                        boolean: {},
                    },
                    name: 'Cycle',
                    description: 'If the option should cycle from the last to the first.',
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
        select_previous: {
            name: 'Previous',
            description: 'Selects the previous option.',
            fields: {
                cycle: {
                    default: true,
                    selector: {
                        boolean: {},
                    },
                    name: 'Cycle',
                    description: 'If the option should cycle from the first to the last.',
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
