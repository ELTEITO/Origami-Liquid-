// ==================== NAVBAR AUTHENTICATION ====================
// Función global para manejar la autenticación del navbar

async function initNavbarAuth() {
  console.log('initNavbarAuth ejecutándose...');
  
  const authButton = document.getElementById('authButton');
  if (!authButton) {
    console.log('Botón de autenticación no encontrado, reintentando en 200ms...');
    // Reintentar después de un breve delay
    setTimeout(initNavbarAuth, 200);
    return;
  }
  console.log('Botón de autenticación encontrado:', authButton);

  try {
    // Cargar axios si no está disponible
    if (typeof axios === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
      await new Promise((resolve, reject) => { 
        script.onload = resolve; 
        script.onerror = reject; 
        document.head.appendChild(script); 
      });
    }

    // Verificar autenticación usando el endpoint del backend
    const res = await axios.get('/Admin/verify', { withCredentials: true });
    
    if (res?.data?.isAuthenticated) {
      // Usuario logueado - cambiar a "Volver al Panel"
      authButton.href = 'admin/dashboard.html';
      authButton.setAttribute('aria-label', 'Volver al Panel');
      
      const labelElement = authButton.querySelector('.btn-login__label');
      const iconElement = authButton.querySelector('i');
      
      if (labelElement) {
        labelElement.textContent = 'Volver al Panel';
      }
      
      if (iconElement) {
        iconElement.className = 'fa-solid fa-cog';
      }
      
      console.log('Botón actualizado a "Volver al Panel"');
    } else {
      console.log('Usuario no autenticado - mostrando "Iniciar sesión"');
    }
  } catch (error) {
    console.log('Error verificando autenticación:', error.message);
    console.log('Mostrando "Iniciar sesión" por defecto');
  }
}

// Función para verificar si el usuario está autenticado
async function isUserAuthenticated() {
  try {
    // Cargar axios si no está disponible
    if (typeof axios === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
      await new Promise((resolve, reject) => { 
        script.onload = resolve; 
        script.onerror = reject; 
        document.head.appendChild(script); 
      });
    }

    const res = await axios.get('/Admin/verify', { withCredentials: true });
    return res?.data?.isAuthenticated || false;
  } catch (error) {
    console.log('Error verificando autenticación:', error.message);
    return false;
  }
}

// Función para actualizar el navbar cuando cambie el estado de autenticación
async function updateNavbarAuth() {
  await initNavbarAuth();
}

// Escuchar cambios en el localStorage para actualizar el navbar automáticamente
window.addEventListener('storage', function(e) {
  if (e.key === 'token' || e.key === 'authToken' || e.key === 'jwt' || e.key === 'accessToken') {
    updateNavbarAuth();
  }
});

// Función para ejecutar automáticamente cuando el DOM esté listo
function autoInitNavbarAuth() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbarAuth);
  } else {
    initNavbarAuth();
  }
}

// NO ejecutar automáticamente - solo cuando se llame explícitamente
// autoInitNavbarAuth();

// Observer para detectar cuando se agrega el navbar al DOM
function setupNavbarObserver() {
  const targetNode = document.body;
  const config = { childList: true, subtree: true };
  
  const callback = function(mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Verificar si se agregó el navbar
            if (node.id === 'navbar-placeholder' || 
                (node.querySelector && node.querySelector('#authButton'))) {
              console.log('Navbar detectado, ejecutando initNavbarAuth...');
              setTimeout(() => initNavbarAuth(), 100);
            }
            // También verificar si el contenido del navbar-placeholder cambió
            if (node.id === 'navbar-placeholder' && node.innerHTML.includes('authButton')) {
              console.log('Contenido del navbar detectado, ejecutando initNavbarAuth...');
              setTimeout(() => initNavbarAuth(), 100);
            }
          }
        }
      }
    }
  };
  
  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);
  
  return observer;
}

// Configurar el observer cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNavbarObserver);
} else {
  setupNavbarObserver();
}

// Exportar funciones para uso global
window.initNavbarAuth = initNavbarAuth;
window.isUserAuthenticated = isUserAuthenticated;
window.updateNavbarAuth = updateNavbarAuth;
