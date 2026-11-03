import { chromium } from 'playwright';
import { readFileSync,writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const q=JSON.parse(readFileSync('evidence/quality/summary.json','utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const rows=[['Archivos ESLint',q.files],['Errores ESLint',q.errors],['Advertencias ESLint',q.warnings],['Funciones medidas',q.complexity.functions],['Complejidad media',q.complexity.average.toFixed(2)],['Complejidad máxima',q.complexity.max],['Funciones con complejidad > 15',q.complexity.above15],['Duplicación de líneas (jscpd)',q.duplication.percentage.toFixed(2)+' %'],['Pares de fragmentos clonados',q.duplication.clones],['Build exit code',q.buildExitCode],['npm audit completo',JSON.stringify(q.audit.vulnerabilities)],['npm audit producción',JSON.stringify(q.productionAudit.vulnerabilities)]];
writeFileSync('evidence/quality/report.html',`<!doctype html><meta charset="utf-8"><title>KairoLabs · Verificación estática</title><style>body{font:19px system-ui;margin:40px;color:#17304a}h1{font-size:32px}table{border-collapse:collapse;width:100%}td{padding:12px;border-bottom:1px solid #ccd}td:first-child{font-weight:bold;width:44%}.note{padding:20px;background:#fff2d5}</style><h1>KairoLabs · Resultados de análisis estático</h1><p>Reporte generado a partir de summary.json · ${esc(q.date)}</p><table>${rows.map(([a,b])=>`<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('')}</table><p class="note">El build y ESLint no tienen errores bloqueantes. Persisten advertencias y dependencias vulnerables. No es una aprobación global de seguridad o mantenibilidad.</p>`);
const browser=await chromium.launch();
try {
 for(const [file,out]of [['evidence/quality/report.html','evidence/quality/quality-summary.png'],['evidence/bdd/cucumber-desktop.html','evidence/bdd/cucumber-desktop.png'],['evidence/bdd/cucumber-mobile.html','evidence/bdd/cucumber-mobile.png']]) {
 const page=await browser.newPage({viewport:{width:1440,height:1080}});await page.goto(pathToFileURL(resolve(file)).href);await page.waitForTimeout(1500);if(file.includes('cucumber'))await page.getByText('bdd\\core.feature',{exact:true}).click();console.log(file,(await page.locator('body').innerText()).slice(0,250));await page.screenshot({path:out,fullPage:false});await page.close();
 }
}finally{await browser.close();}
