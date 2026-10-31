# Core Entities Unit Tests

Requiere Node.js 24+. Desde la raíz: `npm run test:unit`. No requiere npm install ni API.

20 casos sobre Device, Subscription y SignInCommand importados directamente de src/. Incluye regresión de temperaturas null, undefined y vacías, sin confundirlas con cero.

Registro reproducible: `npm run test:unit:tap`. Los resultados guardados están en evidence/unit/latest.tap.
