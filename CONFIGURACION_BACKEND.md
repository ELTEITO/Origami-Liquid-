# Configuración Backend - Frontend Integration

## ✅ Cambios Implementados

### 1. Capa de Servicios API

**Archivos Creados:**

- `admin/js/config.js` - Configuración de URLs del backend
- `admin/js/api-service.js` - Cliente HTTP con axios para todos los endpoints

**Características:**
- Auto-detección de ambiente (desarrollo/producción)
- Interceptors para logging y manejo de errores
- Manejo automático de cookies (withCredentials)
- Redirección automática en errores de autenticación

### 2. Autenticación Real

**Archivo Modificado:** `admin/js/auth.js`

**Cambios:**
- ✅ Eliminadas credenciales hardcoded
- ✅ Implementado login con backend: `POST /Admin/login`
- ✅ Implementado logout: `POST /Admin/logout`
- ✅ Verificación de sesión: `GET /Admin/verify`
- ✅ Manejo de estados de loading
- ✅ Mensajes de error personalizados

### 3. Productos conectados al Backend

**Archivo Modificado:** `admin/js/products.js`

**Cambios:**
- ✅ Reemplazado localStorage con `apiService.getProducts()`
- ✅ Implementado eliminación con `apiService.deleteProduct(id)`
- ✅ Adaptación a campos del modelo backend (marca, modelo, precioBase, etc.)
- ✅ Loading states durante peticiones
- ✅ Manejo de errores de red

### 4. Scripts incluidos en HTML

**Archivos Actualizados:**
- `admin/auth/login.html`
- `admin/dashboard.html`
- `admin/products.html`
- `admin/categories.html`
- `admin/orders.html`
- `admin/variants.html`

**Agregado a todos los archivos:**
```html
<!-- Axios CDN -->
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

<!-- API Configuration & Service -->
<script src="js/config.js"></script>
<script src="js/api-service.js"></script>
```

---

## 🔧 Configuración Necesaria

### 1. Configurar URL del Backend

Edita `admin/js/config.js`:

```javascript
// Para desarrollo local (línea 23)
apiUrl: 'http://localhost:5000',  // Cambia el puerto si es diferente

// Para producción (línea 28)
apiUrl: 'https://api.origamiliquid.com',  // Cambia por tu URL de producción
```

### 2. Configurar CORS en el Backend

Edita `appsettings.json` en tu proyecto backend:

```json
{
  "AllowedOrigins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tudominio.com"
  ]
}
```

### 3. Verificar Base de Datos

Asegúrate que PostgreSQL esté corriendo y que el backend pueda conectarse:

```bash
# En el proyecto backend
dotnet ef database update
```

### 4. Correr el Backend

```bash
cd OrigamiLiquidAPI
dotnet run
```

El backend debe estar corriendo en `http://localhost:5000` (o el puerto configurado).

---

## 📝 Endpoints Implementados

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/Admin/login` | Login de administrador |
| POST | `/Admin/logout` | Cerrar sesión |
| GET | `/Admin/verify` | Verificar sesión activa |

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/Producto` | Obtener todos los productos |
| GET | `/api/Producto/{id}` | Obtener producto por ID |
| POST | `/api/Producto` | Crear nuevo producto |
| PUT | `/api/Producto/{id}` | Actualizar producto |
| DELETE | `/api/Producto/{id}` | Eliminar producto |

### Variantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/Producto/{id}/variantes` | Obtener variantes de un producto |
| GET | `/api/Producto/variante/{id}` | Obtener variante por ID |
| POST | `/api/Producto/variante` | Crear nueva variante |
| PUT | `/api/Producto/variante/{id}` | Actualizar variante |
| DELETE | `/api/Producto/variante/{id}` | Eliminar variante |

### Opciones de Variantes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/Producto/{id}/Ram-Opciones` | Obtener opciones de RAM |
| GET | `/api/Producto/{id}/Almacenamiento-Opciones` | Obtener opciones de almacenamiento |
| GET | `/api/Producto/{id}/Color-Opciones` | Obtener opciones de color |
| GET | `/api/Producto/{id}/variante` | Obtener variante por specs |

---

## 🧪 Testing

### 1. Probar Login

1. Abre `admin/auth/login.html`
2. Ingresa credenciales válidas
3. Verifica que redirija al dashboard
4. Revisa la consola del navegador para logs de API

### 2. Probar Productos

1. Abre `admin/products.html`
2. Verifica que la tabla cargue productos del backend
3. Intenta eliminar un producto
4. Verifica que los cambios se reflejen en la base de datos

### 3. Verificar Autenticación

1. Cierra sesión
2. Intenta acceder directamente a `admin/products.html`
3. Debe redirigir automáticamente al login

---

## ⚠️ Tareas Pendientes

### Alta Prioridad

1. **Modificar FormProducto.js** - Actualizar para crear/editar productos con API
2. **Modificar FormVariante.js** - Actualizar para crear/editar variantes con API
3. **Actualizar store-integration.js** - Consumir productos públicos del backend

### Media Prioridad

4. **Implementar categorías** - Conectar categories.js con backend (si existe endpoint)
5. **Implementar pedidos** - Conectar orders.js con backend (si existe endpoint)
6. **Dashboard stats** - Obtener estadísticas del backend

---

## 🐛 Debugging

### Ver logs de API

Abre la consola del navegador (F12) y busca mensajes que empiecen con `[API]`:

```
[API] Request: GET /api/Producto
[API] Response: 200 [...]
```

### Habilitar logs solo en desarrollo

Los logs están automáticamente habilitados en `localhost` y deshabilitados en producción.

Para cambiar esto, edita `admin/js/config.js`:

```javascript
development: {
  enableLogging: true  // Cambia a false para desactivar
}
```

### Errores comunes

**Error: Network Error**
- Verifica que el backend esté corriendo
- Revisa la URL en `config.js`
- Verifica CORS en el backend

**Error 401: Unauthorized**
- La sesión expiró, inicia sesión nuevamente
- Verifica que las cookies estén habilitadas

**Error 404: Not Found**
- El endpoint no existe en el backend
- Verifica la ruta en `api-service.js`

---

## 📚 Estructura de Archivos

```
admin/
├── js/
│   ├── config.js              ✅ NUEVO - Configuración API
│   ├── api-service.js         ✅ NUEVO - Cliente HTTP
│   ├── auth.js                ✅ MODIFICADO - Login real
│   ├── products.js            ✅ MODIFICADO - Usa API
│   ├── FormProducto.js        ⚠️  PENDIENTE - Actualizar
│   ├── FormVariante.js        ⚠️  PENDIENTE - Actualizar
│   ├── categories.js          ⚠️  PENDIENTE - Actualizar
│   ├── orders.js              ⚠️  PENDIENTE - Actualizar
│   └── variants.js            ⚠️  PENDIENTE - Actualizar
├── auth/
│   └── login.html             ✅ MODIFICADO - Incluye scripts
├── dashboard.html             ✅ MODIFICADO - Incluye scripts
├── products.html              ✅ MODIFICADO - Incluye scripts
├── categories.html            ✅ MODIFICADO - Incluye scripts
├── orders.html                ✅ MODIFICADO - Incluye scripts
└── variants.html              ✅ MODIFICADO - Incluye scripts
```

---

## 🚀 Next Steps

1. **Probar la integración actual** - Login y productos
2. **Actualizar FormProducto.js** - Para crear/editar productos
3. **Actualizar FormVariante.js** - Para gestionar variantes
4. **Sincronizar tienda pública** - Actualizar store-integration.js
5. **Deployment** - Configurar URLs de producción

---

## 💡 Tips

- **Siempre revisa la consola del navegador** para ver errores de API
- **Usa Postman o curl** para probar endpoints del backend directamente
- **Verifica que las cookies funcionen** - crucial para autenticación
- **Mantén el backend corriendo** mientras pruebas el frontend

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa la consola del navegador (F12)
2. Revisa los logs del backend
3. Verifica que CORS esté configurado correctamente
4. Asegúrate que la base de datos esté actualizada