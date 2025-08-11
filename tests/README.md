# Tests

Esta carpeta contiene todos los archivos de prueba y testing del proyecto.

## Archivos de Prueba

### Pruebas de Funcionalidad
- `test-calendario-funcional.js` - Pruebas del sistema de calendario
- `test-complete-login.js` - Pruebas completas del sistema de autenticación
- `test-crear-contenido.js` - Pruebas de creación de contenido (noticias/eventos)
- `test-noticia-detalle.js` - Pruebas de visualización de detalles de noticias
- `test-final-noticias.js` - Pruebas finales del sistema de noticias

### Pruebas de UI/UX
- `test-direccion-texto.js` - Pruebas de dirección de texto en editores
- `test-login.html` - Página de prueba para el sistema de login

### Ejecución de Pruebas

```bash
# Desde la raíz del proyecto
npm run test              # Ejecuta todas las pruebas
npm run test:calendar     # Solo pruebas del calendario

# Ejecutar prueba específica
cd tests
node test-calendario-funcional.js
```

## Configuración de Pruebas

Las pruebas requieren que tanto el servidor como la base de datos estén funcionando:

1. Servidor en puerto 5002
2. Base de datos MySQL con datos de prueba
3. Cliente en puerto 3001 (para pruebas de UI)

## Reportes de Pruebas

Los resultados de las pruebas se guardan automáticamente y pueden encontrarse en la carpeta `docs/reports/`.
