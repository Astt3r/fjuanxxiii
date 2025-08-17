## Fundación Juan XXIII - Estado Técnico y Plan de Mejora

Este documento resume el análisis inicial del repositorio (agosto 2025) y propone una ruta de refactor SIN perder funcionalidad ni contenido.

### Problemas Detectados
1. Inconsistencia de acceso a base de datos: algunas rutas usan `mysql.createConnection` directo (`authRoutes`), otras usan el pool central (`config/database.js`).
2. Repetición de helpers de respuesta (success/failure) definidos en múltiples archivos.
3. Mezcla de responsabilidades en rutas (validaciones, formateo, reglas de negocio y SQL en el mismo archivo).
4. Falta de capa de servicios / repositorios que permita aislar lógica de negocio de Express.
5. Ausencia de pruebas automatizadas unitarias (solo scripts manuales e integraciones ad hoc en `/tests` y archivos sueltos en raíz).
6. Manejo de errores heterogéneo: `errorHandler` contempla errores de Mongoose (no usado) y códigos MySQL limitados, mientras varias rutas responden manualmente.
7. Variables de entorno parcialmente usadas (p.ej. `JWT_SECRET` hardcode fallback) y falta de validación temprana.
8. Ficheros de rutas extensos (ej: `noticiasRoutes.js` >400 líneas) difíciles de mantener.
9. Duplicación de librerías de hashing: se instalan `bcrypt` y `bcryptjs` (usar solo uno).
10. Dependencia `node-fetch` duplicada (v2 en raíz y cliente, v3 en servidor) — riesgo de confusión ESM/CJS.
11. No hay script de linting / formateo ni guía de contribución.
12. No hay documentación de endpoints (OpenAPI / Postman collection) para onboarding rápido.
13. Seguridad: falta de sanitización más profunda (ej: `express-validator` instalado pero casi no se usa) y cabeceras CSP configuradas de forma básica.

### Enfoque de Mejora Propuesto (Iterativo, de Bajo Riesgo)
Fases incrementales para no romper el sitio:

Fase 0 (Hardening mínimo inmediato)
- Unificar helpers de respuesta (`/server/src/utils/response.js`).
- Corregir archivos corruptos (ej: línea basura en `events.js` ya arreglado).
- Validar variables críticas al inicio (fail-fast si falta `JWT_SECRET`).
- Eliminar dependencias duplicadas (mantener `bcrypt` y remover `bcryptjs`).

Fase 1 (Estructura lógica)
- Introducir capa `/server/src/services/` para cada agregado: `authService`, `noticiasService`, `eventosService`.
- Capa `/server/src/repositories/` con consultas SQL encapsuladas.
- Rutas se reducen a validación + llamada a servicio + mapping de respuesta.

Fase 2 (Calidad y confiabilidad)
- Añadir ESLint + Prettier + scripts: `lint`, `lint:fix`.
- Añadir pruebas unitarias básicas (Jest) para servicios (auth, noticias, eventos) + pruebas de integración con supertest para endpoints críticos.
- Configurar GitHub Actions (lint + test) antes de merge a `main`.

Fase 3 (Observabilidad y monitoreo)
- Middleware de métricas (p.ej. Prometheus exporter opcional) y logging estructurado (p.ej. pino) reemplazando `console.log`.
- Endpoint `/api/health` ampliado con verificación ligera de DB (SELECT 1) y versionado.

Fase 4 (Documentación y DX)
- Generar OpenAPI spec (ya sea manual o usando swagger-jsdoc) servida en `/api/docs`.
- README de cliente y servidor separados con pasos de despliegue.
- Añadir `CONTRIBUTING.md` y `ARCHITECTURE.md`.

Fase 5 (Seguridad y performance)
- Revisar CSP dinámica dependiendo de entorno.
- Implementar refresh tokens y rotación (si se amplía auth).
- Cache selectiva (ej: noticias públicas) usando capa en memoria (LRU) o Redis opcional.

### Estructura Objetivo (Servidor)
```
server/src/
	config/
	middleware/
	routes/
	services/
	repositories/
	utils/
	validators/
	app.js
	server.js
```

### Refactor Seguro (Reglas)
- Un solo cambio conceptual por PR interno.
- Mantener endpoints actuales (no romper paths) hasta publicar versión mayor.
- Añadir pruebas antes de reescrituras profundas.
- Mantener contratos de respuesta (shape JSON) — solo enriquecer metadatos.

### Helper de Respuesta (Ejemplo)
```js
// utils/response.js
exports.ok = (res, data, meta) => res.json({ success: true, data, ...(meta? { meta }: {}) });
exports.created = (res, data) => res.status(201).json({ success: true, data });
exports.fail = (res, message, status = 400, extra) => res.status(status).json({ success: false, message, ...(extra||{}) });
```

### Checklist de Inicio (Aplicado / Pendiente)
- [x] Corregido `events.js` corrupción.
- [x] Centralizar helpers de respuesta.
- [x] Validación de env al boot.
- [x] Unificar bcrypt (eliminar bcryptjs pendiente de borrar del package).
- [x] Eliminar bcryptjs y node-fetch (server) de dependencias duplicadas.
- [ ] Eliminar duplicados bcrypt / node-fetch.
- [ ] Añadir ESLint/Prettier.
- [ ] Crear servicios y repositorios iniciales.
- [ ] Pruebas unitarias básicas.
- [ ] OpenAPI draft.

### Próximo Paso Sugerido
Crear `utils/response.js` y actualizar 1-2 rutas para usarlo como patrón mínimo; luego introducir validación de env.

---
Este README se irá actualizando conforme avance el refactor progresivo.

