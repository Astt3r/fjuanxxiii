# Scripts de Utilidad

Esta carpeta contiene scripts útiles para diagnóstico, verificación y mantenimiento del sistema.

## Scripts Disponibles

### Verificación de Sistema
- `verificar-bd.js` - Verifica la conexión y estado de la base de datos
- `verificar-calendario-bd.js` - Verifica específicamente el sistema de calendario
- `verificar-estadisticas-dashboard.js` - Verifica las estadísticas del dashboard

### Diagnóstico
- `diagnosticar-login.js` - Diagnostica problemas del sistema de autenticación
- `debug-noticia-detalle.js` - Debug para problemas de visualización de noticias

### Integración
- `prueba-integracion.js` - Pruebas de integración entre componentes

## Uso

```bash
# Desde la raíz del proyecto
npm run verify:db         # Verificar base de datos
npm run verify:calendar   # Verificar calendario
npm run debug:login       # Diagnosticar login

# Ejecutar script específico
cd scripts
node verificar-bd.js
```

## Configuración

Los scripts utilizan las mismas variables de entorno que el servidor principal:
- Configuración de base de datos desde `server/.env`
- URLs de API configuradas automáticamente

## Logs

Los scripts generan logs detallados que se muestran en consola y pueden ser redirigidos a archivos si es necesario.
