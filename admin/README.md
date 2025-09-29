# Panel de Administración Origami

Sistema de administración completo para la tienda Origami, integrado con el diseño existente.

## 🚀 Acceso al Sistema

### URL de Acceso
- **Login Principal**: `/auth/login.html` (desde el navbar)
- **Admin Directo**: `/admin/login.html`

### Credenciales de Administrador
```
Usuario: admin
Contraseña: origami2025
```

## 📋 Funcionalidades

### 🔐 Sistema de Autenticación
- Login seguro con validación
- Gestión de sesiones con localStorage
- Protección automática de rutas admin
- Expiración de sesión (8 horas)

### 📊 Dashboard Principal
- **Métricas en tiempo real**
  - Total de productos
  - Categorías disponibles
  - Pedidos pendientes y completados
  - Ingresos totales
- **Gráfico de ventas** (canvas nativo)
- **Actividad reciente** del sistema
- **Top categorías** por productos
- **Exportación de datos** completa

### 🛍️ Gestión de Productos
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar)
- **Filtros avanzados**:
  - Por categoría
  - Por estado (activo, inactivo, borrador)
  - Búsqueda por nombre/marca/modelo
- **Vista previa de imágenes** en tiempo real
- **Paginación** inteligente
- **Validación** completa de datos

### 🏷️ Gestión de Categorías
- **Interfaz moderna** tipo tarjetas
- **Slugs automáticos** para URLs amigables
- **Iconos Font Awesome** con vista previa
- **Contador de productos** por categoría
- **Validación de duplicados**
- **Integración con productos**

### 🎨 Gestión de Variantes
- **Tipos soportados**:
  - Color (con color picker)
  - Almacenamiento
  - Tamaño
  - Memoria RAM
  - Otros
- **Ajustes de precio** (+/-) por variante
- **Orden personalizable** para visualización
- **Vista previa visual** en tiempo real
- **Asociación con productos**

### 📦 Gestión de Pedidos
- **Visualización completa** de pedidos
- **Estados de pedido**:
  - Pendiente
  - Procesando
  - Enviado
  - Entregado
  - Cancelado
- **Cambio de estados** con historial
- **Detalles completos**:
  - Información del cliente
  - Productos pedidos
  - Historial de cambios
- **Filtros por estado** y fecha
- **Generador de pedidos** de prueba

## 🔧 Arquitectura Técnica

### Tecnologías Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Almacenamiento**: localStorage
- **Diseño**: Glass-morphism
- **Iconos**: Font Awesome 6
- **Sin frameworks**: Vanilla JavaScript

### Estructura de Archivos
```
admin/
├── login.html              # Login de administrador
├── dashboard.html          # Dashboard principal
├── products.html           # Gestión de productos
├── categories.html         # Gestión de categorías
├── variants.html          # Gestión de variantes
├── orders.html            # Gestión de pedidos
├── css/
│   └── admin.css          # Estilos del panel admin
└── js/
    ├── auth.js            # Sistema de autenticación
    ├── storage.js         # Gestión de datos localStorage
    ├── dashboard.js       # Controlador del dashboard
    ├── products.js        # Controlador de productos
    ├── categories.js      # Controlador de categorías
    ├── variants.js        # Controlador de variantes
    └── orders.js          # Controlador de pedidos

auth/
└── login.html             # Selector de tipo de login
```

### Sistema de Datos
Los datos se almacenan en localStorage con las siguientes claves:

- `admin_products`: Productos
- `admin_categories`: Categorías
- `admin_variants`: Variantes
- `admin_orders`: Pedidos
- `admin_timestamps`: Marcas de tiempo
- `adminSession`: Sesión del administrador

## 🎨 Diseño e Integración

### Consistencia Visual
- **Mismo diseño** que la tienda original
- **Glass-morphism** en todos los componentes
- **Backgrounds rotativos** idénticos
- **Paleta de colores** coherente
- **Tipografía** consistente

### Responsive Design
- **Mobile-first** approach
- **Breakpoints** optimizados
- **Navegación adaptativa**
- **Tablas responsivas**

### Integración con la Tienda
- **Conexión automática** con el navbar existente
- **Sincronización de productos** entre admin y tienda
- **Actualización en tiempo real** de cambios
- **Sistema de notificaciones**

## 📱 Uso del Sistema

### Flujo de Trabajo Típico

1. **Acceso**:
   - Ir a cualquier página de la tienda
   - Hacer clic en "Iniciar sesión" en el navbar
   - Seleccionar "Panel de Administración"
   - Introducir credenciales

2. **Gestión de Categorías**:
   - Crear categorías antes que productos
   - Definir iconos y descriptions
   - Verificar slugs únicos

3. **Gestión de Productos**:
   - Crear productos asignándolos a categorías
   - Agregar imágenes y precios
   - Configurar estados

4. **Gestión de Variantes**:
   - Crear variantes para productos existentes
   - Configurar ajustes de precio
   - Definir orden de aparición

5. **Seguimiento de Pedidos**:
   - Monitorear pedidos entrantes
   - Actualizar estados
   - Gestionar historial

### Funciones Especiales

#### Exportación de Datos
- Desde el dashboard, clic en "Exportar Datos"
- Descarga archivo JSON con todos los datos
- Útil para respaldos

#### Generación de Pedidos de Prueba
- Desde gestión de pedidos
- Clic en "Crear Pedido de Prueba"
- Genera pedido con productos existentes

#### Filtros Avanzados
- Todos los listados incluyen filtros
- Búsqueda en tiempo real
- Paginación automática

## 🔒 Seguridad

### Medidas Implementadas
- **Validación de sesión** en cada página
- **Expiración automática** de sesiones
- **Protección de rutas** administrativas
- **Validación de datos** en formularios
- **Sanitización** de entradas

### Limitaciones
- Sistema basado en localStorage (frontend only)
- No hay encriptación de datos
- Sesiones locales únicamente
- Un solo usuario administrador

## 🚀 Próximas Mejoras

### Funcionalidades Futuras
- [ ] Sistema multi-usuario
- [ ] Roles y permisos
- [ ] API backend
- [ ] Base de datos real
- [ ] Sistema de notificaciones push
- [ ] Análisis avanzados con gráficos
- [ ] Gestión de inventario
- [ ] Sistema de cupones y descuentos

### Integraciones Planeadas
- [ ] Cuentas de cliente
- [ ] Sistema de registro
- [ ] Pasarelas de pago
- [ ] Integración con redes sociales
- [ ] Sistema de reviews
- [ ] Chat de soporte

## 🛠️ Desarrollo y Mantenimiento

### Para Desarrolladores

#### Agregar Nueva Funcionalidad
1. Crear controlador en `/admin/js/`
2. Crear vista en `/admin/`
3. Agregar estilos en `/admin/css/admin.css`
4. Integrar con el sistema de navegación

#### Modificar Datos
- Los datos se gestionan a través de `storage.js`
- Todos los controladores usan `storageManager`
- Las modificaciones se sincronizan automáticamente

#### Personalizar Estilos
- Variables CSS en `Liquid1.css`
- Estilos específicos del admin en `admin.css`
- Componentes modulares y reutilizables

---

**Desarrollado para Origami** - Sistema de administración completo e integrado.