# 🚀 Instrucciones para Ejecutar el Portal de la Fundación Juan XXIII

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** (versión >= 16.0.0)
- **npm** (versión >= 8.0.0)
- **MySQL** (para la base de datos)
- **Git** (para control de versiones)

### Verificar Instalaciones
```bash
node --version
npm --version
mysql --version
```

## 🏗️ Configuración Inicial

### 1. Instalar Dependencias
Desde la raíz del proyecto, ejecuta:
```bash
npm run install-all
```

Este comando instalará las dependencias de:
- Proyecto principal
- Cliente (React)
- Servidor (Node.js/Express)

### 2. Configurar Base de Datos
1. Asegúrate de que MySQL esté ejecutándose
2. Crea una base de datos para el proyecto
3. Configura las variables de entorno en el servidor (ver archivo `.env` en la carpeta `server`)

### 3. Ejecutar Migraciones (si es necesario)
```bash
cd server
npm run migrate
npm run seed
```

## 🚀 Métodos de Ejecución

### Opción 1: Ejecutar Todo (Recomendado)
Desde la raíz del proyecto:
```bash
npm run dev
```
Este comando ejecuta simultáneamente:
- **Servidor** en http://localhost:5001
- **Cliente** en http://localhost:3000

### Opción 2: Ejecutar por Separado

#### Servidor (Backend)
```bash
# Desde la raíz del proyecto
npm run server:dev

# O directamente desde la carpeta server
cd server
npm run dev
```

#### Cliente (Frontend)
```bash
# Desde la raíz del proyecto
npm run client:dev

# O directamente desde la carpeta client
cd client
npm start
```

### Opción 3: Producción
```bash
# Construir el cliente
npm run build

# Ejecutar en modo producción
npm start
```

## 🌐 Puertos y URLs

- **Frontend (React)**: http://localhost:3000
- **Backend (API)**: http://localhost:5001
- **Documentación API**: http://localhost:5001/api/docs (si está disponible)

## 🔧 Scripts Disponibles

### Scripts Principales
- `npm run dev` - Ejecuta desarrollo completo (cliente + servidor)
- `npm run server:dev` - Solo servidor en modo desarrollo
- `npm run client:dev` - Solo cliente en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Ejecuta en modo producción

### Scripts de Utilidad
- `npm run test` - Ejecuta pruebas de login
- `npm run test:calendar` - Pruebas del calendario
- `npm run verify:db` - Verifica conexión a base de datos
- `npm run debug:login` - Diagnóstico de problemas de login

## 🛠️ Resolución de Problemas

### Puerto en Uso
Si el puerto 3000 o 5001 está en uso:
```bash
# Windows
netstat -an | findstr "3000\|5001"

# Detener procesos de Node.js
Stop-Process -Name node -Force
```

### Problemas de Dependencias
```bash
# Limpiar caché de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Problemas de Base de Datos
```bash
# Verificar conexión
npm run verify:db

# Ejecutar diagnóstico
npm run debug:login
```

## 📁 Estructura del Proyecto

```
fjuanxxiii/
├── client/          # Frontend React
├── server/          # Backend Node.js/Express
├── tests/           # Pruebas automatizadas
├── scripts/         # Scripts de utilidad
├── docs/           # Documentación
└── package.json    # Configuración principal
```

## 🔑 Credenciales por Defecto

- **Email**: admin@fundacionjuanxxiii.cl
- **Contraseña**: admin123

## 📱 Funcionalidades Principales

- ✅ Sistema de autenticación
- ✅ Gestión de noticias y contenido
- ✅ Calendario de eventos
- ✅ Dashboard administrativo
- ✅ Subida de archivos y protocolos
- ✅ Sistema de estadísticas

## 🔄 Cambios Recientes

### Eliminación de Funcionalidades de Capacidad y Costo
Se han eliminado todas las referencias a cantidad de personas y costo en eventos:
- ❌ Campo "Capacidad máxima" en formularios de eventos
- ❌ Campo "Inscritos" en la visualización de eventos
- ❌ Campo "Costo (CLP)" en formularios de eventos
- ❌ Campos `max_participantes` y `participantes_actuales` en la base de datos
- ❌ Visualización de "X / Y inscritos" en las tarjetas de eventos
- ❌ Referencias a precios o costos de eventos

Los eventos ahora se centran únicamente en la información esencial: título, descripción, fecha, hora, ubicación y categoría.

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en la consola
2. Ejecuta `npm run verify:db` para verificar la base de datos
3. Usa `npm run debug:login` para problemas de autenticación
4. Revisa la documentación en la carpeta `docs/`

## 🔄 Actualizar el Proyecto

```bash
git pull origin main
npm run install-all
npm run dev
```

---

**¡Listo para comenzar! 🎉**

Ejecuta `npm run dev` y ve a http://localhost:3000 para ver la aplicación en funcionamiento.
