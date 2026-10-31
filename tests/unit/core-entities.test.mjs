import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

// Solo importa clases de dominio: no carga Vite, api.js, stores ni servicios HTTP.
const root = process.env.KAIROLABS_FRONTEND_ROOT
  ? pathToFileURL(resolve(process.env.KAIROLABS_FRONTEND_ROOT) + '/').href
  : new URL('../../', import.meta.url).href;
const { Device } = await import(new URL('src/monitoring/domain/model/device.entity.js', root));
const { Subscription } = await import(new URL('src/subscriptions/domain/model/subscription.entity.js', root));
const { SignInCommand } = await import(new URL('src/iam/domain/sign-in.command.js', root));

const cases = [
  ['UT-DEV-01 conserva sede y lectura cero al construir el dispositivo', () => {
    const device = new Device({ id: 7, establishment_id: 2, temperature: 0 });
    assert.equal(device.establishment_id, 2);
    assert.equal(device.temperature, 0);
  }],
  ['UT-DEV-02 interpreta enabled_sensors recibido como JSON', () => {
    assert.deepEqual(new Device({ enabled_sensors: '{"temperature":true}' }).enabled_sensors, { temperature: true });
  }],
  ['UT-DEV-03 tolera JSON incompleto sin interrumpir el dominio', () => {
    assert.equal(new Device({ enabled_sensors: '{invalid' }).enabled_sensors, null);
  }],
  ['UT-DEV-04 clasifica 4.5 grados como ok', () => assert.equal(Device.evaluateMetric('temperature', 4.5), 'ok')],
  ['UT-DEV-05 clasifica 8.1 grados como critical', () => assert.equal(Device.evaluateMetric('temperature', 8.1), 'critical')],
  ['UT-DEV-06 clasifica 1.9 grados como critical', () => assert.equal(Device.evaluateMetric('temperature', 1.9), 'critical')],
  ['UT-DEV-07 clasifica 7.1 grados como warning', () => assert.equal(Device.evaluateMetric('temperature', 7.1), 'warning')],
  ['UT-DEV-08 distingue los limites de warning y critical', () => {
    assert.equal(Device.evaluateMetric('temperature', 2), 'warning');
    assert.equal(Device.evaluateMetric('temperature', 8), 'warning');
  }],
  ['UT-DEV-09 identifica texto no numerico como unknown', () => assert.equal(Device.evaluateMetric('temperature', 'sin lectura'), 'unknown')],
  ['UT-DEV-10 identifica temperatura null como unknown', () => {
    assert.equal(Device.evaluateMetric('temperature', null), 'unknown');
    assert.equal(Device.evaluateMetric('temperature', undefined), 'unknown');
    assert.equal(Device.evaluateMetric('temperature', 0), 'critical');
  }],
  ['UT-DEV-11 identifica temperatura vacia como unknown', () => {
    assert.equal(Device.evaluateMetric('temperature', ''), 'unknown');
    assert.equal(Device.evaluateMetric('temperature', '   '), 'unknown');
    assert.equal(Device.evaluateMetric('temperature', '\t\n'), 'unknown');
    assert.equal(Device.evaluateMetric('temperature', '0'), 'critical');
  }],
  ['UT-DEV-12 clasifica puerta abierta como critical', () => assert.equal(Device.evaluateMetric('door', 'Open'), 'critical')],
  ['UT-DEV-13 clasifica puerta cerrada como ok', () => assert.equal(Device.evaluateMetric('door', 'Closed'), 'ok')],
  ['UT-DEV-14 recupera luz desde el alias lux', () => assert.equal(Device.readField({ lux: 120 }, Device.findMetricDef('light')), 120)],
  ['UT-SUB-01 traduce basic a BASIC', () => assert.equal(Subscription.catalogIdToApiPlan('basic'), 'BASIC')],
  ['UT-SUB-02 traduce PREMIUM al catalogo premium', () => assert.equal(Subscription.apiPlanToCatalogId('PREMIUM'), 'premium')],
  ['UT-SUB-03 traduce enterprise a ENTERPRISE', () => assert.equal(Subscription.catalogIdToApiPlan('enterprise'), 'ENTERPRISE')],
  ['UT-SUB-04 usa basic ante un plan desconocido', () => assert.equal(Subscription.apiPlanToCatalogId('UNKNOWN'), 'basic')],
  ['UT-IAM-01 normaliza espacios y mayusculas del correo', () => assert.equal(new SignInCommand({ email: '  OPERADOR@EXAMPLE.COM ', password: 'demo', segment: 'operational-staff' }).email, 'operador@example.com')],
  ['UT-IAM-02 conserva exactamente la clave y el segmento', () => {
    const command = new SignInCommand({ email: 'a@example.com', password: ' AbC! ', segment: 'health-entity' });
    assert.equal(command.password, ' AbC! ');
    assert.equal(command.segment, 'health-entity');
  }],
];

for (const [name, check] of cases) test(name, check);

