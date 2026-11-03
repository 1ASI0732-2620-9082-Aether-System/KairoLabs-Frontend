import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdirSync, writeFileSync, openSync, closeSync } from 'node:fs';
import assert from 'node:assert/strict';
const api = process.env.KAIROLABS_IT_URL;
assert.equal(api, 'http://127.0.0.1:5187', 'Ejecutar mediante scripts/run-bdd.ps1; solo API local.');
assert.match(process.env.KAIROLABS_IT_DATABASE ?? '', /^kairolabs_it_[a-f0-9]{12}$/);
mkdirSync('evidence/bdd', { recursive: true });
writeFileSync('evidence/bdd/network.jsonl','');
const password = 'Synthetic-BDD-Only-2026!';
const email = `bdd-${Date.now()}@example.invalid`;
async function request(path, body, token) {
 const response = await fetch(api + '/api/v1' + path, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
 assert.ok(response.ok, `${path}: HTTP ${response.status}`); return response.json();
}
await request('/users', { name:'Cuenta BDD', dni:'00000000', email, phone:'900000000', job_title:'Pruebas', entry_date:'2026-11-02', role:'Admin', password, photo:'', entity_name:'Entidad BDD' });
const { user, token } = await request('/users/sign-in', { email, password });
const admin = (await request('/admins', null, token)).find(a => Number(a.user_id) === Number(user.id));
assert.ok(admin);
const siteName = 'Sede BDD reproducible';
const site = await request(`/admins/${admin.id}/establishments`, { establishment_name:siteName, establishment_type:'Warehouse', address:'Direccion sintetica 100', district:'Pruebas', city_region:'Lima', country:'Peru', latitude:-12.04, longitude:-77.03, phone:'900000000', email:'site@example.invalid', website:'https://example.invalid' }, token);
const deviceName = 'Refrigerador BDD reproducible';
await request(`/establishments/${site.id}/devices`, { exact_location:deviceName, type_of_medication:'Refrigerated', enabled_sensors:'{"temperature":true}' }, token);
const env = { ...process.env, VITE_USE_MOCKS:'false', VITE_API_BASE_URL:api+'/api/v1', VITE_MEDITRACK_SENSOR_US_AD_API:api+'/api/v1', VITE_MEDITRACK_SENSOR_DV_API:api+'/api/v1', VITE_MEDITRACK_SENSOR_SUB_EST_API:api+'/api/v1', VITE_MEDITRACK_SENSOR_OP_TR_API:api+'/api/v1', VITE_VITAL_CARE_API_URL:api+'/api/v1', BDD_SEED:JSON.stringify({ email,password,siteName,deviceName }) };
// Ensure no endpoint environment variable accidentally points to production.
for (const key of Object.keys(env)) if (key.startsWith('VITE_') && /API|URL/.test(key)) env[key]=api+'/api/v1';
const fd=openSync('evidence/bdd/vite.log','w');
const vite=spawn(process.execPath,['node_modules/vite/bin/vite.js','--mode','bdd','--host','localhost','--port','5173','--strictPort'],{ env, stdio:['ignore',fd,fd], windowsHide:true });
let exit=0;
try {
 let ready=false;
 for(let i=0;i<100;i++) { try { if ((await fetch('http://localhost:5173/login')).ok) { ready=true;break; } } catch {} await new Promise(r=>setTimeout(r,300)); }
 assert.ok(ready,'Frontend local no responde');
 const viewports=process.env.KAIROLABS_BDD_VIEWPORT==='all'||!process.env.KAIROLABS_BDD_VIEWPORT?['desktop','mobile']:[process.env.KAIROLABS_BDD_VIEWPORT];
 for(const viewport of viewports) {
  const child=spawn(process.execPath,['node_modules/@cucumber/cucumber/bin/cucumber.js','bdd/core.feature','--import','bdd/steps.mjs','--format','progress','--format',`json:evidence/bdd/cucumber-${viewport}.json`,'--format',`html:evidence/bdd/cucumber-${viewport}.html`],{ env:{...env,BDD_VIEWPORT:viewport},stdio:'inherit',windowsHide:true });
  const [code]=await once(child,'exit'); if(code!==0) exit=code??1;
 }
 writeFileSync('evidence/bdd/environment.json',JSON.stringify({date:new Date().toISOString(),api,frontend:'http://localhost:5173',database:process.env.KAIROLABS_IT_DATABASE,mocks:false,browser:'Chromium',viewports},null,2));
} finally { vite.kill();closeSync(fd); }
process.exitCode=exit;
