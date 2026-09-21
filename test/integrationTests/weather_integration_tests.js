/* global before it */
const tools = require('./testTools');
const expect = require('chai').expect;

async function testUpdates(harness, states, entity) {
    for (const state of states) {
        await tools.validateStateChange(
            harness,
            entity.entity_id,
            async () => await harness.states.setStateAsync(state.iobId, state.updatedValue),
            entity => {
                if (state.attribute === 'state') {
                    expect(entity).to.have.property('state', state.updatedValue);
                } else {
                    expect(entity).to.have.nested.property(`attributes.${state.attribute}`, state.updatedValue);
                }
            },
        );
    }
}

exports.runTests = function (suite) {
    suite('weather', getHarness => {
        //adapter will keep running for all test. harness and initial entities will be initialized once in before.
        let harness;
        //let entities;
        let objects;

        //load all test objects here:
        const jsonFiles = [];

        //start adapter and get initial entities.
        const idsWithEnums = [];
        const initialStates = [];
        before(async () => {
            tools.clearClient();
            //get harness && entities here.
            harness = getHarness();
            objects = await tools.loadMultipleObjects(jsonFiles);
            await tools.startAndGetEntities(harness, objects, idsWithEnums, initialStates);
        });

        jsonFiles.push('../testData/weather_accuweather.json');
        idsWithEnums.push('accuweather.0.Summary');
        it('should create weather entity for accuweather and update correctly', async () => {
            const deviceId = 'accuweather.0.Summary';

            const states = [
                {
                    attribute: 'state',
                    iobId: `${deviceId}.WeatherIconURL`,
                    initialValue: 'iconURL',
                    updatedValue: 'iconURLUpdated',
                },
                {
                    attribute: 'temperature',
                    iobId: `${deviceId}.Temperature`,
                    initialValue: 25,
                    updatedValue: 30,
                },
                {
                    attribute: 'pressure',
                    iobId: `${deviceId}.Pressure`,
                    initialValue: 10,
                    updatedValue: 11,
                },
                {
                    attribute: 'humidity',
                    iobId: `${deviceId}.RelativeHumidity`,
                    initialValue: 30,
                    updatedValue: 40,
                },
                {
                    attribute: 'wind_speed',
                    iobId: `${deviceId}.WindSpeed`,
                    initialValue: 5,
                    updatedValue: 8,
                },
                {
                    attribute: 'wind_bearing',
                    iobId: `${deviceId}.WindDirection`,
                    initialValue: 90,
                    updatedValue: 180,
                },
                {
                    attribute: 'forecast.0.condition',
                    iobId: `${deviceId}.WeatherIconURL`,
                    initialValue: 'iconURL',
                    updatedValue: 'iconURLUpdated',
                },
                {
                    attribute: 'forecast.0.temperature',
                    iobId: `${deviceId}.TempMax_d1`,
                    initialValue: 10,
                    updatedValue: 11,
                },
                {
                    attribute: 'forecast.0.templow',
                    iobId: `${deviceId}.TempMin_d1`,
                    initialValue: 8,
                    updatedValue: 9,
                },
                {
                    attribute: 'forecast.0.precipitation_probability',
                    iobId: `${deviceId}.PrecipitationProbability_d1`,
                    initialValue: 50,
                    updatedValue: 60,
                },
                {
                    attribute: 'forecast.0.precipitation',
                    iobId: `${deviceId}.TotalLiquidVolume_d1`,
                    initialValue: 500,
                    updatedValue: 600,
                },
                {
                    attribute: 'forecast.0.datetime',
                    iobId: `${deviceId}.DateTime_d1`,
                    initialValue: 'Do',
                    updatedValue: 'Fr',
                },
                {
                    attribute: 'forecast.1.condition',
                    iobId: `${deviceId}.WeatherIconURL_d2`,
                    initialValue: 'iconURL1',
                    updatedValue: 'iconURL1Updated',
                },
                {
                    attribute: 'forecast.1.temperature',
                    iobId: `${deviceId}.TempMax_d2`,
                    initialValue: 10,
                    updatedValue: 11,
                },
                {
                    attribute: 'forecast.1.templow',
                    iobId: `${deviceId}.TempMin_d2`,
                    initialValue: 8,
                    updatedValue: 9,
                },
                {
                    attribute: 'forecast.1.precipitation_probability',
                    iobId: `${deviceId}.PrecipitationProbability_d2`,
                    initialValue: 50,
                    updatedValue: 60,
                },
                {
                    attribute: 'forecast.1.precipitation',
                    iobId: `${deviceId}.TotalLiquidVolume_d2`,
                    initialValue: 500,
                    updatedValue: 600,
                },
                {
                    attribute: 'forecast.1.datetime',
                    iobId: `${deviceId}.DateTime_d2`,
                    initialValue: 'Do',
                    updatedValue: 'Fr',
                },
                {
                    attribute: 'forecast.2.condition',
                    iobId: `${deviceId}.WeatherIconURL_d3`,
                    initialValue: 'iconURL2',
                    updatedValue: 'iconURL2Updated',
                },
                {
                    attribute: 'forecast.2.temperature',
                    iobId: `${deviceId}.TempMax_d3`,
                    initialValue: 12,
                    updatedValue: 13,
                },
                {
                    attribute: 'forecast.2.templow',
                    iobId: `${deviceId}.TempMin_d3`,
                    initialValue: 7,
                    updatedValue: 8,
                },
                {
                    attribute: 'forecast.2.precipitation_probability',
                    iobId: `${deviceId}.PrecipitationProbability_d3`,
                    initialValue: 51,
                    updatedValue: 61,
                },
                {
                    attribute: 'forecast.2.precipitation',
                    iobId: `${deviceId}.TotalLiquidVolume_d3`,
                    initialValue: 501,
                    updatedValue: 601,
                },
                {
                    attribute: 'forecast.2.datetime',
                    iobId: `${deviceId}.DateTime_d3`,
                    initialValue: 'Fr',
                    updatedValue: 'Sa',
                },
                {
                    attribute: 'forecast.3.condition',
                    iobId: `${deviceId}.WeatherIconURL_d4`,
                    initialValue: 'iconURL3',
                    updatedValue: 'iconURL3Updated',
                },
                {
                    attribute: 'forecast.3.temperature',
                    iobId: `${deviceId}.TempMax_d4`,
                    initialValue: 14,
                    updatedValue: 15,
                },
                {
                    attribute: 'forecast.3.templow',
                    iobId: `${deviceId}.TempMin_d4`,
                    initialValue: 4,
                    updatedValue: 5,
                },
                {
                    attribute: 'forecast.3.precipitation_probability',
                    iobId: `${deviceId}.PrecipitationProbability_d4`,
                    initialValue: 52,
                    updatedValue: 62,
                },
                {
                    attribute: 'forecast.3.precipitation',
                    iobId: `${deviceId}.TotalLiquidVolume_d4`,
                    initialValue: 502,
                    updatedValue: 602,
                },
                {
                    attribute: 'forecast.3.datetime',
                    iobId: `${deviceId}.DateTime_d4`,
                    initialValue: 'Sa',
                    updatedValue: 'So',
                },
                {
                    attribute: 'forecast.4.condition',
                    iobId: `${deviceId}.WeatherIconURL_d5`,
                    initialValue: 'iconURL4',
                    updatedValue: 'iconURL4Updated',
                },
                {
                    attribute: 'forecast.4.temperature',
                    iobId: `${deviceId}.TempMax_d5`,
                    initialValue: 20,
                    updatedValue: 21,
                },
                {
                    attribute: 'forecast.4.templow',
                    iobId: `${deviceId}.TempMin_d5`,
                    initialValue: 10,
                    updatedValue: 12,
                },
                {
                    attribute: 'forecast.4.precipitation_probability',
                    iobId: `${deviceId}.PrecipitationProbability_d5`,
                    initialValue: 53,
                    updatedValue: 63,
                },
                {
                    attribute: 'forecast.4.precipitation',
                    iobId: `${deviceId}.TotalLiquidVolume_d5`,
                    initialValue: 503,
                    updatedValue: 603,
                },
                {
                    attribute: 'forecast.4.datetime',
                    iobId: `${deviceId}.DateTime_d5`,
                    initialValue: 'So',
                    updatedValue: 'Mo',
                },
            ];
            const promises = [];
            for (const stateSet of states) {
                promises.push(harness.states.setStateAsync(stateSet.iobId, stateSet.initialValue, true));
            }
            await Promise.all(promises); //set initial states here.
            await tools.delay(1000); //fails online -> wait a little more for state updates to be processed.
            const entities = await tools.sendToAsync(harness, 'lovelace.0', 'browse'); //Get updated entities.

            const entity = entities.find(e => e.context.deviceId === deviceId && e.entity_id.startsWith('weather.'));
            expect(entity).to.be.ok;
            console.log('Got entity:');
            console.dir(entity, { depth: null });

            expect(entity).to.have.property('state', 'iconURL');
            for (const state of states) {
                if (state.attribute !== 'state') {
                    expect(entity).to.have.nested.property(`attributes.${state.attribute}`, state.initialValue);
                }
            }
            await testUpdates(harness, states, entity);
        });

        jsonFiles.push('../testData/weather_daswetter_v3.json');
        idsWithEnums.push('daswetter.0.NextDays.Location_1');
        it('should create weather entity for daswetter with right data on right days and update correctly', async () => {
            const deviceId = 'daswetter.0.NextDays.Location_1';

            const states = [
                {
                    attribute: 'state',
                    iobId: `${deviceId}.Day_1.iconURL`,
                    initialValue: 'iconURL',
                    updatedValue: 'iconURLUpdated',
                },
                {
                    attribute: 'temperature',
                    iobId: `${deviceId}.Day_1.Maximale_Temperatur_value`,
                    initialValue: 25,
                    updatedValue: 30,
                },
                {
                    attribute: 'forecast.0.condition',
                    iobId: `${deviceId}.Day_1.iconURL`,
                    initialValue: 'iconURL',
                    updatedValue: 'iconURLUpdated',
                },
                {
                    attribute: 'forecast.0.temperature',
                    iobId: `${deviceId}.Day_1.Maximale_Temperatur_value`,
                    initialValue: 25,
                    updatedValue: 30,
                },
                {
                    attribute: 'forecast.0.templow',
                    iobId: `${deviceId}.Day_1.Minimale_Temperatur_value`,
                    initialValue: 7,
                    updatedValue: 6,
                },
                {
                    attribute: 'forecast.1.condition',
                    iobId: `${deviceId}.Day_2.iconURL`,
                    initialValue: 'iconURL1',
                    updatedValue: 'iconURL1Updated',
                },
                {
                    attribute: 'forecast.1.temperature',
                    iobId: `${deviceId}.Day_2.Maximale_Temperatur_value`,
                    initialValue: 10,
                    updatedValue: 11,
                },
                {
                    attribute: 'forecast.1.templow',
                    iobId: `${deviceId}.Day_2.Minimale_Temperatur_value`,
                    initialValue: 8,
                    updatedValue: 9,
                },
                {
                    attribute: 'forecast.2.condition',
                    iobId: `${deviceId}.Day_3.iconURL`,
                    initialValue: 'iconURL2',
                    updatedValue: 'iconURL2Updated',
                },
                {
                    attribute: 'forecast.2.temperature',
                    iobId: `${deviceId}.Day_3.Maximale_Temperatur_value`,
                    initialValue: 12,
                    updatedValue: 13,
                },
                {
                    attribute: 'forecast.2.templow',
                    iobId: `${deviceId}.Day_3.Minimale_Temperatur_value`,
                    initialValue: 7,
                    updatedValue: 8,
                },
                {
                    attribute: 'forecast.3.condition',
                    iobId: `${deviceId}.Day_4.iconURL`,
                    initialValue: 'iconURL3',
                    updatedValue: 'iconURL3Updated',
                },
                {
                    attribute: 'forecast.3.temperature',
                    iobId: `${deviceId}.Day_4.Maximale_Temperatur_value`,
                    initialValue: 14,
                    updatedValue: 15,
                },
                {
                    attribute: 'forecast.3.templow',
                    iobId: `${deviceId}.Day_4.Minimale_Temperatur_value`,
                    initialValue: 4,
                    updatedValue: 5,
                },
                {
                    attribute: 'forecast.4.condition',
                    iobId: `${deviceId}.Day_5.iconURL`,
                    initialValue: 'iconURL4',
                    updatedValue: 'iconURL4Updated',
                },
                {
                    attribute: 'forecast.4.temperature',
                    iobId: `${deviceId}.Day_5.Maximale_Temperatur_value`,
                    initialValue: 20,
                    updatedValue: 21,
                },
                {
                    attribute: 'forecast.4.templow',
                    iobId: `${deviceId}.Day_5.Minimale_Temperatur_value`,
                    initialValue: 10,
                    updatedValue: 12,
                },
                {
                    attribute: 'forecast.5.condition',
                    iobId: `${deviceId}.Day_6.iconURL`,
                    initialValue: 'iconURL5',
                    updatedValue: 'iconURL5Updated',
                },
                {
                    attribute: 'forecast.5.temperature',
                    iobId: `${deviceId}.Day_6.Maximale_Temperatur_value`,
                    initialValue: 30,
                    updatedValue: 31,
                },
                {
                    attribute: 'forecast.5.templow',
                    iobId: `${deviceId}.Day_6.Minimale_Temperatur_value`,
                    initialValue: 13,
                    updatedValue: 14,
                },
                {
                    attribute: 'forecast.6.condition',
                    iobId: `${deviceId}.Day_7.iconURL`,
                    initialValue: 'iconURL6',
                    updatedValue: 'iconURL6Updated',
                },
                {
                    attribute: 'forecast.6.temperature',
                    iobId: `${deviceId}.Day_7.Maximale_Temperatur_value`,
                    initialValue: 25,
                    updatedValue: 28,
                },
                {
                    attribute: 'forecast.6.templow',
                    iobId: `${deviceId}.Day_7.Minimale_Temperatur_value`,
                    initialValue: 15,
                    updatedValue: 17,
                },
            ];
            const promises = [];
            for (const stateSet of states) {
                promises.push(harness.states.setStateAsync(stateSet.iobId, stateSet.initialValue, true));
            }
            await Promise.all(promises); //set initial states here.
            await tools.delay(1000); //fails online -> wait a little more for state updates to be processed.
            const entities = await tools.sendToAsync(harness, 'lovelace.0', 'browse'); //Get updated entities.

            const entity = entities.find(e => e.context.deviceId === deviceId && e.entity_id.startsWith('weather.'));
            expect(entity).to.be.ok;

            expect(entity).to.have.property('state', 'iconURL');
            for (const state of states) {
                if (state.attribute !== 'state') {
                    expect(entity).to.have.nested.property(`attributes.${state.attribute}`, state.initialValue);
                }
            }

            for (let day = 0; day < entity.attributes.forecast.length; day += 1) {
                const forecast = entity.attributes.forecast[day];
                expect(forecast).to.have.property('datetime');
                const date = new Date(forecast.datetime);
                expect(date).to.be.ok;
                const now = new Date();
                now.setDate(now.getDate() + day);
                expect(date.getDate()).to.equal(now.getDate());
            }

            await testUpdates(harness, states, entity);

            const newTS = Date.now() - 10 * 24 * 60 * 60 * 1000;
            await tools.validateStateChange(
                harness,
                entity.entity_id,
                async () =>
                    await harness.states.setStateAsync(`${deviceId}.Day_7.iconURL`, {
                        val: 'icon6URLNeu',
                        ts: newTS,
                        ack: true,
                    }),
                entity => {
                    const date = new Date(entity.attributes.forecast[6].datetime);
                    const controlDate = new Date(newTS);
                    controlDate.setDate(controlDate.getDate() + 6);
                    expect(date.getDate()).to.equal(controlDate.getDate());
                },
            );
        });

        jsonFiles.push('../testData/weather_daswetter.json');
        idsWithEnums.push('daswetter.0.location_1.ForecastDaily');
        it('should create weather entity for daswetter 4 with loadable icons and a forecast subscription', async () => {
            const deviceId = 'daswetter.0.location_1.ForecastDaily';
            const dump = require('../testData/weather_daswetter.json');
            // The dump carries the values daswetter wrote; states are not created from objects.
            await Promise.all(
                Object.entries(dump)
                    .filter(([, obj]) => obj.type === 'state' && obj.val !== undefined && obj.val !== null)
                    .map(([id, obj]) => harness.states.setStateAsync(id, obj.val, true)),
            );
            await tools.delay(1000);
            const entities = await tools.sendToAsync(harness, 'lovelace.0', 'browse');
            const entity = entities.find(e => e.context.deviceId === deviceId && e.entity_id.startsWith('weather.'));
            expect(entity).to.be.ok;

            // daswetter 4 writes /daswetter.admin/icons/..., which only loads through our /adapter/ route.
            expect(entity.state).to.equal('/adapter/daswetter/icons/weather/gallery1/png/64x64/03.png');
            expect(entity.attributes.pressure).to.equal(1030);
            expect(entity.attributes.forecast).to.have.lengthOf(5);
            expect(entity.attributes.forecast[0]).to.include({
                condition: '/adapter/daswetter/icons/weather/gallery1/png/64x64/03.png',
                temperature: 19.26,
                templow: 10.2,
                datetime: '2026-09-20T22:00:00.000Z',
            });
            // a daily forecast: the card editor offers "daily" and the card asks for it
            expect(entity.attributes.supported_features).to.equal(1);

            // A card set up in the editor has a forecast_type and only takes the forecast from
            // weather/subscribe_forecast, never from the attribute.
            const WebSocket = require('ws');
            const client = new WebSocket(`ws://localhost:${tools.lovelacePort}`);
            const events = [];
            await new Promise((resolve, reject) => {
                client.on('error', reject);
                client.on('open', () => {
                    client.send(JSON.stringify({ id: 1, type: 'auth', access_token: 'no_token' }));
                    client.send(
                        JSON.stringify({
                            id: 2,
                            type: 'weather/subscribe_forecast',
                            entity_id: entity.entity_id,
                            forecast_type: 'daily',
                        }),
                    );
                });
                client.on('message', data => {
                    const message = JSON.parse(data.toString('utf8'));
                    if (message.id === 2 && message.type === 'event') {
                        events.push(message.event);
                        resolve();
                    }
                });
            });
            try {
                expect(events[0].type).to.equal('daily');
                expect(events[0].forecast).to.have.lengthOf(5);
                expect(events[0].forecast[1].temperature).to.equal(17.94);

                // a changed forecast is pushed to the subscription
                await harness.states.setStateAsync(`${deviceId}.Day_2.Temperature_Max`, 22.5, true);
                for (let i = 0; i < 30 && events.length < 2; i++) {
                    await tools.delay(100);
                }
                expect(events).to.have.lengthOf(2);
                expect(events[1].forecast[1].temperature).to.equal(22.5);
            } finally {
                client.close();
            }
        });

        jsonFiles.push('../testData/weather_weatherunderground.json');
        idsWithEnums.push('weatherunderground.0.forecast');
        it('should create weather entity for weatherunderground', async () => {
            const deviceId = 'weatherunderground.0.forecast';

            const states = [
                {
                    attribute: 'state',
                    iobId: `${deviceId}.0d.iconURL`,
                    initialValue: 'iconURL',
                    updatedValue: 'iconURLUpdated',
                },
                {
                    attribute: 'temperature',
                    iobId: `${deviceId}.current.temp`,
                    initialValue: 25,
                    updatedValue: 30,
                },
                {
                    attribute: 'pressure',
                    iobId: `${deviceId}.current.pressure`,
                    initialValue: 10,
                    updatedValue: 11,
                },
                {
                    attribute: 'humidity',
                    iobId: `${deviceId}.0d.humidity`,
                    initialValue: 30,
                    updatedValue: 40,
                },
                {
                    attribute: 'wind_speed',
                    iobId: `${deviceId}.0d.windSpeed`,
                    initialValue: 5,
                    updatedValue: 8,
                },
                {
                    attribute: 'wind_bearing',
                    iobId: `${deviceId}.0d.windDegrees`,
                    initialValue: 90,
                    updatedValue: 180,
                },
                {
                    attribute: 'forecast.0.condition',
                    iobId: `${deviceId}.0d.iconURL`,
                    initialValue: 'iconURL',
                    updatedValue: 'iconURLUpdated',
                },
                {
                    attribute: 'forecast.0.temperature',
                    iobId: `${deviceId}.0d.tempMax`,
                    initialValue: 9,
                    updatedValue: 10,
                },
                {
                    attribute: 'forecast.0.templow',
                    iobId: `${deviceId}.0d.tempMin`,
                    initialValue: 7,
                    updatedValue: 8,
                },
                {
                    attribute: 'forecast.0.precipitation_probability',
                    iobId: `${deviceId}.0d.precipitationChance`,
                    initialValue: 40,
                    updatedValue: 50,
                },
                {
                    attribute: 'forecast.0.datetime',
                    iobId: `${deviceId}.0d.date`,
                    initialValue: 'Mi',
                    updatedValue: 'Do',
                },
                {
                    attribute: 'forecast.0.humidity',
                    iobId: `${deviceId}.0d.humidity`,
                    initialValue: 30,
                    updatedValue: 40,
                },
                {
                    attribute: 'forecast.1.condition',
                    iobId: `${deviceId}.1d.iconURL`,
                    initialValue: 'iconURL1',
                    updatedValue: 'iconURL1Updated',
                },
                {
                    attribute: 'forecast.1.temperature',
                    iobId: `${deviceId}.1d.tempMax`,
                    initialValue: 10,
                    updatedValue: 11,
                },
                {
                    attribute: 'forecast.1.templow',
                    iobId: `${deviceId}.1d.tempMin`,
                    initialValue: 8,
                    updatedValue: 9,
                },
                {
                    attribute: 'forecast.1.precipitation_probability',
                    iobId: `${deviceId}.1d.precipitationChance`,
                    initialValue: 50,
                    updatedValue: 60,
                },
                {
                    attribute: 'forecast.1.datetime',
                    iobId: `${deviceId}.1d.date`,
                    initialValue: 'Do',
                    updatedValue: 'Fr',
                },
                {
                    attribute: 'forecast.1.humidity',
                    iobId: `${deviceId}.1d.humidity`,
                    initialValue: 34,
                    updatedValue: 45,
                },
                {
                    attribute: 'forecast.2.condition',
                    iobId: `${deviceId}.2d.iconURL`,
                    initialValue: 'iconURL2',
                    updatedValue: 'iconURL2Updated',
                },
                {
                    attribute: 'forecast.2.temperature',
                    iobId: `${deviceId}.2d.tempMax`,
                    initialValue: 12,
                    updatedValue: 13,
                },
                {
                    attribute: 'forecast.2.templow',
                    iobId: `${deviceId}.2d.tempMin`,
                    initialValue: 7,
                    updatedValue: 8,
                },
                {
                    attribute: 'forecast.2.precipitation_probability',
                    iobId: `${deviceId}.2d.precipitationChance`,
                    initialValue: 51,
                    updatedValue: 61,
                },
                {
                    attribute: 'forecast.2.datetime',
                    iobId: `${deviceId}.2d.date`,
                    initialValue: 'Fr',
                    updatedValue: 'Sa',
                },
                {
                    attribute: 'forecast.2.humidity',
                    iobId: `${deviceId}.2d.humidity`,
                    initialValue: 51,
                    updatedValue: 60,
                },
                {
                    attribute: 'forecast.3.condition',
                    iobId: `${deviceId}.3d.iconURL`,
                    initialValue: 'iconURL3',
                    updatedValue: 'iconURL3Updated',
                },
                {
                    attribute: 'forecast.3.temperature',
                    iobId: `${deviceId}.3d.tempMax`,
                    initialValue: 14,
                    updatedValue: 15,
                },
                {
                    attribute: 'forecast.3.templow',
                    iobId: `${deviceId}.3d.tempMin`,
                    initialValue: 4,
                    updatedValue: 5,
                },
                {
                    attribute: 'forecast.3.precipitation_probability',
                    iobId: `${deviceId}.3d.precipitationChance`,
                    initialValue: 52,
                    updatedValue: 62,
                },
                {
                    attribute: 'forecast.3.datetime',
                    iobId: `${deviceId}.3d.date`,
                    initialValue: 'Sa',
                    updatedValue: 'So',
                },
                {
                    attribute: 'forecast.3.humidity',
                    iobId: `${deviceId}.3d.humidity`,
                    initialValue: 32,
                    updatedValue: 41,
                },
            ];
            const promises = [];
            for (const stateSet of states) {
                promises.push(harness.states.setStateAsync(stateSet.iobId, stateSet.initialValue, true));
            }
            await Promise.all(promises); //set initial states here.
            await tools.delay(1000); //fails online -> wait a little more for state updates to be processed.
            const entities = await tools.sendToAsync(harness, 'lovelace.0', 'browse'); //Get updated entities.

            const entity = entities.find(e => e.context.deviceId === deviceId && e.entity_id.startsWith('weather.'));
            expect(entity).to.be.ok;

            expect(entity).to.have.property('state', 'iconURL');
            for (const state of states) {
                if (state.attribute !== 'state') {
                    expect(entity).to.have.nested.property(`attributes.${state.attribute}`, state.initialValue);
                }
            }
            await testUpdates(harness, states, entity);
        });
    });
};
