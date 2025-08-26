# Limpieza aplicada (bundle de cambios)

Este bundle incluye cambios mínimos y seguros para **unificar puertos/URLs**, **endurecer auth/roles**, **sanear logs**, y **preparar lint/tests/CI**.

## Qué cambia

- **Cliente**
  - `client/src/config/api.js` y `client/src/utils/media.js`: fallback unificado a `http://localhost:5002` y autodeducción en prod (`/api`).
  - `client/src/services/authService.js`: se eliminan logs sensibles (credenciales), y se protegen los logs con `NODE_ENV !== 'production'`.
  - `client/.eslintrc.cjs`, `package.json`: scripts `lint`, `format` y Prettier.

- **Servidor**
  - `server/.env.example`: `PORT=5002` y sin duplicados de `FRONTEND_URL`.
  - `server/src/middleware/authz.js`: `requireRole(...roles)` para autorización basada en **rol** (JWT).
  - `server/src/routes/adminInvitationsRoutes.js`: usa `requireRole('admin')` en vez de lista de correos.
  - `server/src/utils/sanitize.js`: helper para sanitizar HTML con `sanitize-html`.
  - `server/src/utils/imageSanitizer.js`: helper para re-encodear imágenes con `sharp` y limpiar metadata.
  - `server/package.json`: scripts `lint`, `test` y devDeps (`jest`, `supertest`, `eslint`).
  - `server/jest.config.js` + `server/test/health.test.js`: prueba básica para `/api/health`.

- **Raíz**
  - `.editorconfig`, `.prettierrc`, `.prettierignore`, `.eslintignore`.
  - CI en **GitHub Actions**: `.github/workflows/ci.yml`.

## Cómo aplicar

1. **Haz un commit/backup** de tu repo actual.
2. **Copia** el contenido de este bundle sobre tu carpeta `fjuanxxiii/` (respetando rutas).
3. Instala dependencias nuevas:
   ```bash
   cd server && npm i && cd ..
   cd client && npm i && cd ..
   ```
4. (Opcional pero recomendado) Sanitiza HTML al guardar noticias:
   ```js
   // en rutas de noticias, antes de guardar:
   const { sanitize } = require('../utils/sanitize');
   const cleanContenido = sanitize(contenido);
   ```
5. (Opcional) Re-encodea imágenes tras subir:
   ```js
   const { reencodeToJpeg } = require('../utils/imageSanitizer');
   await reencodeToJpeg(file.path);
   ```
6. Ejecuta chequeos:
   ```bash
   cd server && npm run lint && npm test
   cd ../client && npm run lint
   ```
7. Arranca:
   ```bash
   # .env del server => PORT=5002
   cd server && npm run dev
   cd ../client && npm start
   ```

## Notas

- En producción usa **proxy** (Nginx/Caddy): sirve React y reenvía `/api` al backend.
- Si ya tienes `middleware/authz.js`, esta versión lo **reemplaza** con una implementación estable.
- No tocamos `multer.js` para evitar conflictos; en su lugar añadimos utilidades que puedes invocar tras subir.
