import { Given, When, Then, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, devices } from 'playwright';
import assert from 'node:assert/strict';
import { appendFileSync } from 'node:fs';
const seed=JSON.parse(process.env.BDD_SEED);
const viewport=process.env.BDD_VIEWPORT;
setDefaultTimeout(45000);
Before(async function() {
 this.browser=await chromium.launch({headless:true});
 this.context=await this.browser.newContext(viewport==='mobile'?{...devices['Pixel 7']}:{viewport:{width:1440,height:1000}});
 this.externalApi=[];
 await this.context.route('**/*', async route=>{const req=route.request();if(['fetch','xhr'].includes(req.resourceType())&&!['localhost','127.0.0.1'].includes(new URL(req.url()).hostname)){this.externalApi.push(req.url());await route.abort();}else await route.continue();});
 this.page=await this.context.newPage();this.traffic=[];
 this.page.on('response',r=>{if(r.url().startsWith('http://127.0.0.1:5187/'))this.traffic.push({url:r.url(),status:r.status()});});
 await this.page.goto('http://localhost:5173/login');
 await this.page.locator('input[type=email]').waitFor();
});
Given('que existe una entidad con sede y dispositivo de prueba en la API real',function(){assert.ok(seed.siteName && seed.deviceName);});
async function login(world,password) {
 await world.page.locator('input[type=email]').fill(seed.email);
 await world.page.locator('input[type=password]').fill(password);
 const response=world.page.waitForResponse(r=>r.url().endsWith('/users/sign-in')&&r.request().method()==='POST');
 await world.page.locator('button[type=submit]').click();return await response;
}
When('inicia sesión con credenciales válidas',async function(){assert.equal((await login(this,seed.password)).status(),200);await this.page.waitForURL('**/iam/home/health-entity');});
When('inicia sesión con una contraseña incorrecta',async function(){assert.equal((await login(this,'Incorrect-Only!')).status(),401);});
Then('se muestra el panel autenticado',async function(){await this.page.locator('main').waitFor();assert.ok(await this.page.evaluate(()=>!!JSON.parse(sessionStorage.getItem('meditrack_auth_session'))?.token));});
Then('muestra un error y conserva la pantalla de acceso',async function(){await this.page.locator('.reg-compact__error').first().waitFor();assert.match(this.page.url(),/\/login$/);assert.equal(await this.page.evaluate(()=>sessionStorage.getItem('meditrack_auth_session')),null);});
When('navega al listado de establecimientos',async function(){const r=this.page.waitForResponse(r=>r.url().includes('/establishments')&&r.request().method()==='GET'&&r.status()===200);await this.page.goto('http://localhost:5173/establishment/establishments');await r;});
Then('la sede persistida se muestra en pantalla',async function(){await this.page.getByText(seed.siteName,{exact:true}).first().waitFor();});
When('navega al listado de dispositivos',async function(){const r=this.page.waitForResponse(r=>r.url().includes('/devices')&&r.request().method()==='GET'&&r.status()===200);await this.page.goto('http://localhost:5173/monitoring/devices');await r;});
Then('el dispositivo persistido se muestra en pantalla',async function(){await this.page.getByText(seed.deviceName,{exact:true}).first().waitFor();});
After(async function({pickle,result}) {
 const slug=pickle.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
 try {
  const image=await this.page.screenshot({path:`evidence/bdd/${viewport}-${slug}.png`,fullPage:true});
  await this.attach(image,'image/png');
  assert.equal(this.externalApi.length,0,'Se intent� consultar una API externa; petici�n bloqueada.');
  appendFileSync('evidence/bdd/network.jsonl',JSON.stringify({viewport,scenario:pickle.name,status:result.status,requests:this.traffic,blockedExternalApi:this.externalApi})+'\n');
 } finally {await this.context?.close();await this.browser?.close();}
});
