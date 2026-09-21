import { expect } from 'chai';
import sinon from 'sinon';
import WeatherForecastModule, { detectForecastType, updateForecastFeature } from './weatherForecast';

const DAY = 24 * 3600000;
const T0 = Date.parse('2026-09-20T22:00:00.000Z');

function daily(count = 5): Record<string, unknown>[] {
    return Array.from({ length: count }, (_, i) => ({
        datetime: new Date(T0 + i * DAY).toISOString(),
        condition: '/adapter/daswetter/icons/weather/gallery1/png/64x64/03.png',
        temperature: 19 + i,
        templow: 10,
    }));
}

function makeWs(): { ws: any; sent: any[] } {
    const sent: any[] = [];
    return { ws: { readyState: 1, send: (data: string) => sent.push(JSON.parse(data)) }, sent };
}

function makeModule(forecast: unknown): { mod: WeatherForecastModule; responses: any[]; entity: any } {
    const responses: any[] = [];
    const entity = { entity_id: 'weather.forecastdaily', attributes: { forecast } };
    const mod = new WeatherForecastModule({
        sendResponse: (_ws, id, result) => responses.push({ id, result }),
        entityData: {
            entityId2Entity: { 'weather.forecastdaily': entity },
            iobID2entity: { 'daswetter.0.day1.temp': [entity] },
        },
    });
    return { mod, responses, entity };
}

describe('modules/weatherForecast detectForecastType', function () {
    it('tells daily, twice daily and hourly forecasts apart by the gap between the entries', function () {
        const at = (gap: number): Record<string, unknown>[] =>
            [0, 1, 2].map(i => ({ datetime: new Date(T0 + i * gap).toISOString() }));
        expect(detectForecastType(at(DAY))).to.equal('daily');
        expect(detectForecastType(at(12 * 3600000))).to.equal('twice_daily');
        expect(detectForecastType(at(3600000))).to.equal('hourly');
    });

    it('cannot tell with too few entries or without dates', function () {
        expect(detectForecastType(daily(2))).to.equal(undefined);
        expect(detectForecastType([{ datetime: 'x' }, { datetime: 'y' }, { datetime: 'z' }])).to.equal(undefined);
        expect(detectForecastType(undefined)).to.equal(undefined);
    });

    it('sets the forecast feature of the entity, daily when it cannot tell', function () {
        const entity: { attributes: Record<string, unknown> } = { attributes: { forecast: daily() } };
        updateForecastFeature(entity);
        expect(entity.attributes.supported_features).to.equal(1);

        entity.attributes.forecast = [0, 1, 2].map(i => ({ datetime: new Date(T0 + i * 3600000).toISOString() }));
        updateForecastFeature(entity);
        expect(entity.attributes.supported_features).to.equal(2);

        entity.attributes.forecast = [{ datetime: 'soon' }];
        updateForecastFeature(entity);
        expect(entity.attributes.supported_features).to.equal(1);
    });
});

describe('modules/weatherForecast subscription', function () {
    afterEach(function () {
        sinon.restore();
    });

    it('acknowledges and delivers the forecast of the entity', function () {
        const { mod, responses } = makeModule(daily());
        const { ws, sent } = makeWs();

        const handled = mod.processMessage(ws, {
            type: 'weather/subscribe_forecast',
            entity_id: 'weather.forecastdaily',
            forecast_type: 'daily',
            id: 7,
        });

        expect(handled).to.equal(true);
        expect(responses).to.deep.equal([{ id: 7, result: null }]);
        expect(sent[0].id).to.equal(7);
        expect(sent[0].type).to.equal('event');
        expect(sent[0].event.type).to.equal('daily');
        expect(sent[0].event.forecast).to.have.lengthOf(5);
        expect(sent[0].event.forecast[0].temperature).to.equal(19);
    });

    it('has no forecast of a kind the entity does not have', function () {
        const { mod } = makeModule(daily());
        const { ws, sent } = makeWs();
        mod.processMessage(ws, {
            type: 'weather/subscribe_forecast',
            entity_id: 'weather.forecastdaily',
            forecast_type: 'hourly',
            id: 7,
        });
        expect(sent[0].event).to.deep.equal({ type: 'hourly', forecast: null });
    });

    it('ignores other messages', function () {
        const { mod } = makeModule(daily());
        expect(mod.processMessage(makeWs().ws, { type: 'weather/convertible_units', id: 1 })).to.equal(false);
    });

    it('pushes a changed forecast once, after its states settled', function () {
        const clock = sinon.useFakeTimers();
        const { mod, entity } = makeModule(daily());
        const { ws, sent } = makeWs();
        mod.processMessage(ws, {
            type: 'weather/subscribe_forecast',
            entity_id: 'weather.forecastdaily',
            forecast_type: 'daily',
            id: 7,
        });

        entity.attributes.forecast[0].temperature = 25;
        mod.onStateChange('daswetter.0.day1.temp', null, { clients: [ws] });
        mod.onStateChange('daswetter.0.day1.temp', null, { clients: [ws] });
        clock.tick(200);

        expect(sent).to.have.lengthOf(2);
        expect(sent[1].event.forecast[0].temperature).to.equal(25);

        // unchanged forecast: nothing to push
        mod.onStateChange('daswetter.0.day1.temp', null, { clients: [ws] });
        clock.tick(200);
        expect(sent).to.have.lengthOf(2);
    });

    it('stops pushing after unsubscribing', function () {
        const clock = sinon.useFakeTimers();
        const { mod, entity } = makeModule(daily());
        const { ws, sent } = makeWs();
        mod.processMessage(ws, {
            type: 'weather/subscribe_forecast',
            entity_id: 'weather.forecastdaily',
            forecast_type: 'daily',
            id: 7,
        });

        mod.removeSubscription(ws, 7);
        entity.attributes.forecast[0].temperature = 25;
        mod.onStateChange('daswetter.0.day1.temp', null, { clients: [ws] });
        clock.tick(200);

        expect(sent).to.have.lengthOf(1);
    });
});
