# Notas de Seguridad

Este documento resume los cambios de endurecimiento aplicados al backend.

## Registro protegido
- Endpoint `POST /api/auth/register` protegido con `REGISTER_OPEN`.
- Si `REGISTER_OPEN !== 'true'` se exige `invitationCode` válido.
- Respuestas genéricas para evitar enumeración de usuarios.

## Invitaciones
- Tabla `invitations` con hash SHA-256 del código (no se almacena el claro).
- Endpoints admin:
  - `POST /api/admin/invitations` crea invitación y devuelve el código una sola vez.
  - `GET /api/admin/invitations` lista paginada.
- Al usar una invitación se marca `used_at`.

## Rate limiting
- Límite global moderado (existente) + limitador específico de 10 req / 15 min en `/api/auth/*`.

## Validaciones y sanitización
- `express-validator` aplicado a login y register.
- Política de contraseñas: longitud >=10, al menos 1 dígito y 1 letra.
- Sanitización HTML de noticias continuada (sanitize-html) y validaciones de uploads.

## Bcrypt
- Uso de `bcrypt` (coste configurable `BCRYPT_COST`, mínimo forzado 12).

## CORS estricto
- Solo orígenes de la lista blanca (`CLIENT_URL` / `FRONTEND_URL` + localhost en desarrollo).

## Helmet, HSTS y HTTPS
- Helmet con CSP base.
- `ENFORCE_HTTPS=true` fuerza redirección 301 a HTTPS y habilita HSTS.

## Healthcheck
- `GET /api/health` devuelve `{ ok: true, db: 'up' }` si la base responde.

## Base de datos
- Pool centralizado (mysql2/promise).
- Consultas parametrizadas (sin concatenación manual).
- Índice único en `usuarios.email` reforzado por migración.

## Variables de entorno relevantes
```
REGISTER_OPEN=false
FRONTEND_URL=https://tusitio.cl
CLIENT_URL=https://tusitio.cl
ENFORCE_HTTPS=true
BCRYPT_COST=12
JWT_SECRET=coloca_un_secreto_seguro
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=secreto
DB_NAME=fjuan_xxiii
```

Para habilitar registro público temporalmente:
1. Exportar `REGISTER_OPEN=true`
2. Reiniciar el servidor.
3. Revertir a `false` tras finalizar.

## Próximos pasos sugeridos
- Añadir detección de contraseñas débiles con zxcvbn (si se desea).
- Auditoría de dependencias (`npm audit --production`).
- Logging estructurado (p.ej. pino) y correlación de request IDs.
