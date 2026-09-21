import { expect } from 'chai';
import sinon from 'sinon';
import { durationToSeconds, processManualEntity } from './timer';
import { BaseEntity } from '../entities/baseEntity';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const entityData = require('../../../lib/dataSingleton');
entityData.adapter = entityData.adapter || {};
entityData.adapter.namespace = 'lovelace.0';
entityData.log = { warn: () => {}, error: () => {}, debug: () => {} };

const TIMER_ID = 'test.timer.remaining';

function makeObj(type: 'number' | 'string'): ioBroker.Object {
    return {
        _id: TIMER_ID,
        type: 'state',
        common: { name: TIMER_ID, role: '', type, write: true, read: true },
        native: {},
    } as unknown as ioBroker.Object;
}

function makeTimer(type: 'number' | 'string' = 'number'): BaseEntity {
    const obj = makeObj(type);
    const entity = new BaseEntity(null, null, null, obj, 'timer', 'timer.test');
    processManualEntity(TIMER_ID, obj, entity);
    return entity;
}

function command(entity: BaseEntity, service: string): NonNullable<BaseEntity['context']['COMMANDS']>[number] {
    return entity.context.COMMANDS.find(c => c.service === service)!;
}

describe('converters/timer', function () {
    describe('durationToSeconds', function () {
        it('reads the object the duration input of the frontend sends', function () {
            expect(durationToSeconds({ hours: 1, minutes: 2, seconds: 3 })).to.equal(3723);
            expect(durationToSeconds({ minutes: 5 })).to.equal(300);
        });

        it('reads HH:MM:SS, MM:SS and plain seconds', function () {
            expect(durationToSeconds('01:02:03')).to.equal(3723);
            expect(durationToSeconds('05:00')).to.equal(300);
            expect(durationToSeconds(90)).to.equal(90);
            expect(durationToSeconds('90')).to.equal(90);
        });

        it('reads a negative duration, as timer.change uses it', function () {
            expect(durationToSeconds('-00:01:00')).to.equal(-60);
        });

        it('has no value for nothing and for nonsense', function () {
            expect(durationToSeconds(undefined)).to.equal(undefined);
            expect(durationToSeconds('')).to.equal(undefined);
            expect(durationToSeconds('soon')).to.equal(undefined);
        });
    });

    describe('state and attributes', function () {
        it('simulates the state, the remaining time comes from the ioBroker state', function () {
            const entity = makeTimer();
            expect(entity.context.STATE.getId).to.equal(null);
            const attr = entity.context.ATTRIBUTES.find(a => a.attribute === 'remaining')!;
            expect(attr.getId).to.equal(TIMER_ID);
        });

        it('is idle at 0, active while counting and paused when the value stands still', function () {
            const entity = makeTimer();
            const attr = entity.context.ATTRIBUTES.find(a => a.attribute === 'remaining')!;

            attr.getParser!(entity, attr, { val: 0 } as ioBroker.State);
            expect(entity.state).to.equal('idle');

            attr.getParser!(entity, attr, { val: 120 } as ioBroker.State);
            expect(entity.state).to.equal('active');
            expect(entity.attributes.remaining).to.equal('00:02:00');

            attr.getParser!(entity, attr, { val: 119 } as ioBroker.State);
            expect(entity.state).to.equal('active');

            attr.getParser!(entity, attr, { val: 119 } as ioBroker.State);
            expect(entity.state).to.equal('paused');
        });

        it('keeps a HH:MM:SS state as it is', function () {
            const entity = makeTimer('string');
            const attr = entity.context.ATTRIBUTES.find(a => a.attribute === 'remaining')!;
            attr.getParser!(entity, attr, { val: '00:10:00' } as unknown as ioBroker.State);
            expect(entity.attributes.remaining).to.equal('00:10:00');
        });
    });

    describe('commands', function () {
        let setForeignStateAsync: sinon.SinonStub;
        let getForeignStateAsync: sinon.SinonStub;

        beforeEach(function () {
            setForeignStateAsync = sinon.stub().resolves();
            getForeignStateAsync = sinon.stub().resolves({ val: 300 });
            entityData.adapter.setForeignStateAsync = setForeignStateAsync;
            entityData.adapter.getForeignStateAsync = getForeignStateAsync;
        });

        afterEach(function () {
            sinon.restore();
        });

        it('start writes the duration of the service call', async function () {
            const entity = makeTimer();
            const cmd = command(entity, 'start');
            await cmd.parseCommand!(
                entity,
                cmd,
                { id: 1, service: 'start', service_data: { duration: '00:05:00' } },
                'user',
            );
            expect(setForeignStateAsync.calledWith(TIMER_ID, 300, false, { user: 'user' })).to.be.true;
        });

        it('start without a duration restarts with what the state still holds', async function () {
            const entity = makeTimer();
            const cmd = command(entity, 'start');
            await cmd.parseCommand!(entity, cmd, { id: 1, service: 'start', service_data: {} }, 'user');
            expect(setForeignStateAsync.calledWith(TIMER_ID, 300)).to.be.true;
        });

        it('writes HH:MM:SS into a state that holds text', async function () {
            const entity = makeTimer('string');
            const cmd = command(entity, 'start');
            await cmd.parseCommand!(entity, cmd, { id: 1, service: 'start', service_data: { duration: 90 } }, 'user');
            expect(setForeignStateAsync.calledWith(TIMER_ID, '00:01:30')).to.be.true;
        });

        it('cancel and finish set the timer to 0', async function () {
            const entity = makeTimer();
            for (const service of ['cancel', 'finish']) {
                const cmd = command(entity, service);
                await cmd.parseCommand!(entity, cmd, { id: 1, service, service_data: {} }, 'user');
                expect(setForeignStateAsync.calledWith(TIMER_ID, 0), service).to.be.true;
            }
        });

        it('change adds its duration to the remaining time', async function () {
            const entity = makeTimer();
            const cmd = command(entity, 'change');
            await cmd.parseCommand!(
                entity,
                cmd,
                { id: 1, service: 'change', service_data: { duration: '00:01:00' } },
                'user',
            );
            expect(setForeignStateAsync.calledWith(TIMER_ID, 360)).to.be.true;
        });

        it('change never goes below 0', async function () {
            const entity = makeTimer();
            const cmd = command(entity, 'change');
            await cmd.parseCommand!(
                entity,
                cmd,
                { id: 1, service: 'change', service_data: { duration: '-00:10:00' } },
                'user',
            );
            expect(setForeignStateAsync.calledWith(TIMER_ID, 0)).to.be.true;
        });

        it('pause says why it cannot work', async function () {
            const entity = makeTimer();
            const cmd = command(entity, 'pause');
            let message = '';
            try {
                await cmd.parseCommand!(entity, cmd, { id: 1, service: 'pause', service_data: {} }, 'user');
            } catch (e: any) {
                message = e.message;
            }
            expect(message).to.contain('not possible');
            expect(setForeignStateAsync.called).to.be.false;
        });
    });
});
