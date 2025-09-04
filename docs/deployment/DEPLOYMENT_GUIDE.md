# Guía de Despliegue (Producción)

Esta guía cubre: reverse proxy (Nginx), HTTPS + HSTS (Let's Encrypt), cabeceras de seguridad, estrategia de 2FA y refresh tokens, y plantilla de `.env` para producción.

---
## 1. Arquitectura recomendada

```
Internet ─▶ Nginx (443/80) ─▶ Node (Express API :3001) ─▶ MySQL
                            └▶ Static (client build) /uploads (mapeado)
```

Frontend (React build) servido por Nginx como archivos estáticos. Backend detrás de proxy en `/api/`. Opcional: CDN delante de Nginx para caching global.

---
## 2. Nginx (site) ejemplo

Archivo: `/etc/nginx/sites-available/fjuanxxiii.conf`
```nginx
map $http_upgrade $connection_upgrade { default upgrade; '' close; }

server {
  listen 80;
  listen [::]:80;
  server_name fundacionjuanxxiii.cl www.fundacionjuanxxiii.cl;
  # Redirección a HTTPS (Let’s Encrypt validation excepto /.well-known)
  location ^~ /.well-known/acme-challenge/ { root /var/www/certbot; }
  location / { return 301 https://$host$request_uri; }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name fundacionjuanxxiii.cl www.fundacionjuanxxiii.cl;

  # Certs (certbot)
  ssl_certificate /etc/letsencrypt/live/fundacionjuanxxiii.cl/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/fundacionjuanxxiii.cl/privkey.pem;
  ssl_trusted_certificate /etc/letsencrypt/live/fundacionjuanxxiii.cl/chain.pem;

  # TLS
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
  ssl_prefer_server_ciphers off;
  ssl_session_cache shared:SSL:50m;
  ssl_session_timeout 1d;
  ssl_session_tickets off;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header X-Content-Type-Options nosniff;
  add_header X-Frame-Options DENY;
  add_header Referrer-Policy strict-origin-when-cross-origin;
  add_header Permissions-Policy "geolocation=()";
  add_header X-XSS-Protection "0"; # Deshabilitado (moderno)

  # Logs
  access_log /var/log/nginx/fjuanxxiii.access.log; 
  error_log  /var/log/nginx/fjuanxxiii.error.log warn;

  # Limitar tamaño body (ajustar si se suben archivos grandes)
  client_max_body_size 12M;

  # Directorio del build del frontend
  root /var/www/fjuanxxiii/client; 
  index index.html;

  # Gzip / Brotli (si módulo)
  gzip on;
  gzip_comp_level 6;
  gzip_types text/plain text/css application/json application/javascript application/rss+xml image/svg+xml;

  # Cache estáticos
  location ~* \.(?:js|css)$ { expires 7d; add_header Cache-Control "public"; try_files $uri =404; }
  location ~* \.(?:png|jpg|jpeg|gif|webp|ico)$ { expires 30d; add_header Cache-Control "public"; try_files $uri =404; }

  # Subida de imágenes / archivos
  location /uploads/ {
    alias /var/www/fjuanxxiii/uploads/; # enlazar a server/uploads
    add_header Access-Control-Allow-Origin *;
    # No ejecutar scripts
    types { }
    default_type application/octet-stream;
    try_files $uri =404;
  }

  # API proxy
  location /api/ {
    proxy_pass http://127.0.0.1:3001/api/; # backend escucha 3001
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
  }

  # SPA fallback (React Router)
  location / {
    try_files $uri /index.html;
  }
}
```

Habilitar:
```
sudo ln -s /etc/nginx/sites-available/fjuanxxiii.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Certbot (ejemplo):
```
sudo apt install -y certbot
sudo certbot certonly --webroot -w /var/www/certbot -d fundacionjuanxxiii.cl -d www.fundacionjuanxxiii.cl --email admin@fundacionjuanxxiii.cl --agree-tos --no-eff-email
```

Renovar (cron): `0 3 * * * certbot renew --quiet && systemctl reload nginx`

---
## 3. Backend (systemd) ejemplo

Archivo: `/etc/systemd/system/fjuanxxiii-api.service`
```ini
[Unit]
Description=Fundacion Juan XXIII API
After=network.target mysql.service
StartLimitBurst=3
StartLimitIntervalSec=60

[Service]
Type=simple
WorkingDirectory=/var/www/fjuanxxiii/server
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ENFORCE_HTTPS=true
ExecStart=/usr/bin/node src/server.js
Restart=on-failure
RestartSec=5s
User=www-data
Group=www-data
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

Activar:
```
sudo systemctl daemon-reload
sudo systemctl enable --now fjuanxxiii-api
sudo systemctl status fjuanxxiii-api
```

---
## 4. Plantilla `.env.production` sugerida
```
NODE_ENV=production
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=xxxx
DB_PASSWORD=xxxx
DB_NAME=fjuan_xxiii
JWT_SECRET=GENERAR_LARGO_64C_ALFANUM
JWT_EXPIRE=24h
CLIENT_URL=https://www.fundacionjuanxxiii.cl
FRONTEND_URL=https://www.fundacionjuanxxiii.cl
ENFORCE_HTTPS=true
LOGIN_REQUIRE_ORIGIN=true
LOGIN_ORIGINS=https://www.fundacionjuanxxiii.cl
LOGIN_PROTECT=true
EMAIL_HASH_LIMIT_ENABLE=true
CAPTCHA_ENABLE=true
CAPTCHA_PROVIDER=recaptcha
CAPTCHA_SECRET=xxxx
CAPTCHA_FIELD=captchaToken
CONTENT_STRICT_MODE=true
VALIDATE_IMAGE_SIGNATURE=true
MIN_IMAGE_WIDTH=400
MIN_IMAGE_HEIGHT=300
``` 

Mantener este archivo fuera del control de versiones.

---
## 5. HSTS y preload
Ya se añade en Nginx. Después de verificar 1-2 semanas sin problemas puedes enviar a preload: https://hstspreload.org (opcional). Debes mantener `includeSubDomains` y un max-age ≥ 31536000.

---
## 6. Estrategia de Refresh Tokens

Objetivo: reducir ventana de ataque y permitir revocación. Implementación mínima:

Tabla `auth_tokens`:
```sql
CREATE TABLE auth_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  jti CHAR(64) NOT NULL,
  refresh_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  INDEX (user_id),
  UNIQUE KEY (jti)
);
```

Flujo:
1. Login: emitir access token (15m) + refresh token (aleatorio 64 bytes base64url). Guardar hash SHA-256 del refresh.
2. Endpoint `/api/auth/refresh`: recibe refresh token, busca hash, valida no revocado y vigencia → genera nuevo par (rotación). Marca registro anterior `revoked=true`.
3. Logout: marcar todos los refresh del usuario como revocados (o solo el presentado).
4. Revocación preventiva: si password cambia, revocar tokens activos.

Seguridad extra:
* Limitar refresh tokens activos por usuario (ej. 5 dispositivos).
* Registrar `ip`, `user_agent` para auditoría.
* Lista de Access Token revocados opcional con `jti` y expiración corta (Redis) si se requiere invalidación inmediata antes de su exp.

---
## 7. Plan de 2FA (TOTP)

### Esquema DB
Agregar columnas a `usuarios`:
```sql
ALTER TABLE usuarios ADD COLUMN twofa_secret VARCHAR(64) NULL AFTER password;
ALTER TABLE usuarios ADD COLUMN twofa_enabled BOOLEAN DEFAULT FALSE AFTER twofa_secret;
ALTER TABLE usuarios ADD COLUMN recovery_codes TEXT NULL AFTER twofa_enabled;
```

### Flujo
1. Usuario solicita habilitar: backend genera secreto TOTP (`speakeasy.generateSecret()`), guarda `base32` temporal (no activa). Devuelve `otpauth_url` para QR.
2. Usuario envía código TOTP de verificación → backend valida; si correcto: `twofa_enabled=true` y genera recovery codes (10 códigos únicos hash SHA-256 almacenados).
3. Login: tras validar password, si `twofa_enabled`, exigir `otpCode` antes de emitir JWT / refresh.
4. Uso de recovery code: consumir y eliminar (marcar usado). Si quedan 0, forzar regeneración.

### Consideraciones
* Limitar 10 intentos OTP fallidos → bloqueo temporal.
* No enviar si `twofa_enabled` pero falta `otpCode` → responder genérico 401.
* Interfaz: mostrar estado, códigos restantes y opción regenerar (invalida los previos).

### Librerías sugeridas
```
npm i speakeasy qrcode
```

### Endpoints propuestos
```
POST /api/auth/2fa/setup          -> genera secreto + QR (temporal)
POST /api/auth/2fa/enable         -> valida OTP inicial
POST /api/auth/2fa/disable        -> requiere password + OTP
POST /api/auth/2fa/recovery/use   -> usa recovery code
POST /api/auth/2fa/recovery/regenerate -> nueva lista
```

---
## 8. Cabeceras adicionales recomendadas
Aunque Helmet cubre varias, validar:
* `Cross-Origin-Opener-Policy: same-origin` (si no se rompen integraciones).
* `Cross-Origin-Embedder-Policy: require-corp` (solo si no rompe recursos externos, hoy está desactivado).

---
## 9. Monitoreo y Alertas
* Agregar endpoint `/metrics` (Prometheus) o usar un wrapper (e.g. prom-client) para track: `http_requests_total`, `login_fail_total`, `captcha_fail_total`.
* Alertas: picos de 401 / 429 / bloqueos por minuto.

---
## 10. Checklist previo a GO-LIVE
| Ítem | Estado |
|------|--------|
| HTTPS activo con certificado válido | ☐ |
| Redirección HTTP→HTTPS | ☐ |
| HSTS con max-age ≥ 31536000 | ☐ |
| Variables .env producción configuradas | ☐ |
| BACKUP inicial DB tomado | ☐ |
| Scripts `npm audit` sin críticas | ☐ |
| Rate limiting y captcha activados | ☐ |
| Logs centralizados (rotation) | ☐ |
| Sanitización de contenido verificada | ☐ |
| Subidas de archivos validan firmas | ☐ |
| Plan de respaldo/restore probado | ☐ |
| 2FA y refresh tokens (si requeridos) listos | ☐ |

---
## 11. Recuperación ante incidente
1. Revocar todos los refresh tokens (`UPDATE auth_tokens SET revoked=1`).
2. Rotar `JWT_SECRET` (requiere invalidar access tokens activos → corto downtime).
3. Regenerar contraseñas admin.
4. Restaurar desde backup si hay corrupción.

---
## 12. Alternativa rápida: Caddy
Si se prefiere menos configuración manual, Caddy puede manejar TLS automático:
```
fundacionjuanxxiii.cl, www.fundacionjuanxxiii.cl {
  encode gzip zstd
  root * /var/www/fjuanxxiii/client
  try_files {path} /index.html
  header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  header Referrer-Policy "strict-origin-when-cross-origin"
  header Permissions-Policy "geolocation=()"
  @api path /api/*
  reverse_proxy @api 127.0.0.1:3001
  handle_path /uploads/* {
    root * /var/www/fjuanxxiii/uploads
    file_server
  }
}
```

---
## 13. Próximos pasos sugeridos
1. Implementar tabla `auth_tokens` y endpoints refresh.
2. Implementar endpoints 2FA (fase beta con admin).
3. Añadir Prometheus metrics.
4. Pipeline CI: `npm ci && npm run lint && npm test && npm run audit`.

---
Listo: adapta dominios/paths según infraestructura final.
