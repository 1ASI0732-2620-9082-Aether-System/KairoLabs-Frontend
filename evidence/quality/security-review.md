# Revisión de seguridad acotada — 2 de noviembre de 2026 (America/Lima)

## Método y evidencia

Se revisaron reglas eslint-plugin-security sobre src/, resultados npm audit completo y producción, y patrones de renderizado/consulta en las fuentes del frontend/backend. Esto es análisis estático y revisión limitada, no prueba de penetración ni certificación.

- 26 alertas `security/detect-object-injection`: accesos por claves variables requieren revisar procedencia y listas permitidas; no demuestran por sí solos una explotación.
- No se encontraron usos `v-html`/`innerHTML` en el src/ revisado mediante búsqueda textual. Esto no descarta XSS en dependencias, plantillas o flujos no examinados.
- `Iam/Infrastructure/OutboundServices/HashingService.cs` usa BCrypt para hash/verificación. `IT-IAM-01/02` verifican login y rechazo. No se publican tokens en network.jsonl.
- `DatabaseMigrationExtensions.cs` contiene SQL raw para mantenimiento de esquema. En las líneas revisadas se usan sentencias de esquema constantes; esto no permite afirmar que todos los endpoints sean inmunes a SQLi. El reintento y reparación de migraciones quedan pendientes de revisión.
- `Program.cs` exige JWT por defecto. `IT-SEC-01` valida identidad/firma/emisor/audiencia/vencimiento. Sigue pendiente una matriz completa de autorización por rol y pertenencia.
- La sesión usa sessionStorage: no se acredita protección completa ante XSS ni se asume que ocultar tokens en los registros resuelva ese riesgo.

## Plan verificable de mejora

1. Responsable de dependencias del equipo (por asignar): revisar avisos de npm-audit*.json, evaluar actualizaciones compatibles, regenerar lockfile y repetir build + 20 unitarias + 14 integración + 8 ejecuciones BDD. No aplicar automáticamente degradaciones o cambios mayores sugeridos por npm.
2. Responsable IAM (por asignar): dividir completeHealthEntityRegistration (complejidad 25) y loadProfileFromSession (21) por responsabilidades, conservando regresión. Criterio propuesto: funciones nuevas <=15.
3. Responsable frontend (por asignar): revisar 37 comparaciones no estrictas, 2 variables sin uso y 1 prefer-const; resolver casos con pruebas, no sustitución mecánica indiscriminada.
4. Revisión de seguridad del equipo (por asignar): clasificar las 26 claves dinámicas por fuente de entrada y proteger las que sean controladas por usuarios.
5. Reducir duplicación (5,12% con umbral de 50 tokens/5 líneas) extrayendo patrones realmente comunes; no existe umbral contractual aprobado por el equipo.

Las fechas de corrección y aprobación por pares no se inventan: quedan por acordar. Un npm audit con exit code 1 se registra como hallazgo abierto.
