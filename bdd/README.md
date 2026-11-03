# BDD y pruebas de sistema reproducibles

Suite Cucumber.js (Gherkin español) + Playwright Chromium, sobre frontend Vue, API ASP.NET Core 10 y MySQL reales. No se interceptan respuestas con mocks.

## Preparar en Windows x64

Clonar KairoLabs-Frontend y KairoLabs-Platform en carpetas hermanas. Requiere Node.js 24+.

Desde KairoLabs-Platform: `npm run setup` (prepara SDK .NET y MySQL portátiles oficiales).
Desde KairoLabs-Frontend:

```powershell
npm ci
npx playwright install chromium
npm run test:bdd
```

Puertos libres: 5173, 5187 y 33079. El runner no usa producción. Para otra ubicación del backend: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/run-bdd.ps1 -PlatformRoot C:\ruta\KairoLabs-Platform`.

Variantes: `npm run test:bdd:desktop` o `npm run test:bdd:mobile`.

## Qué comprueba

4 escenarios por viewport: login válido y panel, rechazo 401 con error visible, listado de sedes y listado de dispositivos. Las cuentas, sedes y dispositivos sintéticos se crean por API en una base temporal. Las aserciones verifican respuestas HTTP y contenido visible; no basta con abrir una página. Un contexto nuevo por escenario evita reutilizar sesiones. Se bloquean peticiones fetch/XHR a hosts externos y un intento externo hace fallar el caso.

Escritorio: Chromium 1440x1000. Móvil: perfil Pixel 7 de Playwright (emulación, no dispositivo físico). En total son 8 ejecuciones de escenario; no 8 funcionalidades diferentes ni 8 adicionales a sistema: BDD y sistema comparten estos recorridos.

Se guardan JSON Cucumber, HTML con capturas adjuntas, PNG de la aplicación y tráfico sin encabezados ni cuerpos en evidence/bdd/. La captura muestra el estado al terminar el escenario; su aprobación se acredita por las aserciones y el JSON. La base temporal y procesos propios se eliminan al terminar, aun ante fallos. Los datos MySQL portátiles permanecen locales y excluidos de Git.

## Calidad y seguridad

`npm run lint`: ESLint, errores bloqueantes y advertencias visibles.
`npm run quality`: ESLint + complejidad por función + jscpd + npm audit completo y producción + build; evidencia en evidence/quality/.

El comando quality falla ante errores ESLint o compilación fallida. Registra por separado el exit code de npm audit; un código de calidad 0 no significa auditoría de seguridad aprobada. No se instala un hook precommit automáticamente.

Los snapshots de evidencia corresponden a la ejecución publicada y no se deben presentar como evaluación de todo el producto.
