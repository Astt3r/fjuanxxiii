# Configuración del Proyecto

## URLs de Desarrollo
- Frontend: http://localhost:3001
- Backend: http://localhost:5002
- Base de Datos: localhost:3306

## Puertos Utilizados
- Cliente React: 3001
- Servidor Node.js: 5002
- MySQL: 3306

## Variables de Entorno Requeridas

### Server (.env)
```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=fjuan_xxiii
JWT_SECRET=tu_jwt_secret_muy_seguro
PORT=5002
```

## Comandos Útiles

### Desarrollo
```bash
npm run dev              # Servidor + Cliente en paralelo
npm run server:dev       # Solo servidor en modo desarrollo
npm run client:dev       # Solo cliente
```

### Producción
```bash
npm run build           # Construir cliente para producción
npm run start           # Iniciar servidor en modo producción
```

### Mantenimiento
```bash
npm run verify:db       # Verificar base de datos
npm run test           # Ejecutar pruebas
npm install-all        # Instalar todas las dependencias
```

## Estructura de Base de Datos

### Tablas principales:
- `usuarios` - Usuarios administradores
- `noticias` - Artículos y noticias
- `eventos` - Eventos del calendario
- `categorias` - Categorías de contenido

## Credenciales de Prueba
- Email: admin@fundacionjuanxxiii.cl
- Password: admin123

## Rutas Principales

### Frontend
- `/` - Página de inicio
- `/noticias` - Lista de noticias
- `/eventos` - Calendario de eventos
- `/dashboard` - Panel administrativo
- `/login` - Página de login

### API
- `/api/auth/*` - Autenticación
- `/api/noticias/*` - Gestión de noticias
- `/api/eventos/*` - Gestión de eventos
- `/api/upload/*` - Subida de archivos
