// Navbar loader - Carga el componente navbar dinámicamente
document.addEventListener('DOMContentLoaded', function() {
  fetch("Navbar/navbar.html")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      document.getElementById("navbar-placeholder").innerHTML = html;
      // Ejecutar el script del navbar después de insertarlo
      setTimeout(async () => {
        if (typeof initNavbarAuth === 'function') {
          await initNavbarAuth();
        } else {
          console.error('initNavbarAuth no está disponible');
        }
      }, 100);
    })
    .catch(error => {
      console.error('Error loading navbar:', error);
      // Fallback: Insertar navbar directamente
      loadNavbarDirectly();
    });
});

function loadNavbarDirectly() {
  const navbarHTML = `
    <header class="header-bar">
      <h1 style="display:flex;align-items:center;gap:.5rem;margin:0;">
        <span class="logo-circle" aria-hidden="true"
          style="width:36px;height:36px;border-radius:50%;display:inline-block;background:url(img/CanvaLogoWeb.webp?=v) center/cover;overflow:hidden;">
        </span>
        <a href="Liquid1.html" style="text-decoration:none;color:inherit;">Origami</a>
      </h1>

      <nav class="nav-bar">
        <a href="Tienda.html">Tienda</a>
        <a href="Nosotros/nosotros.html">Nosotros</a>
        <div class="nav-search">
          <input id="search" class="nav-search__input" type="search" placeholder="Buscar…" />
          <label for="search" class="nav-search__btn">
            <i class="fa-solid fa-magnifying-glass"></i>
          </label>
        </div>
        <a href="auth/login.html" class="btn-login" id="authButton" aria-label="Iniciar sesión">
          <i class="fa-regular fa-user"></i>
          <span class="btn-login__label">Iniciar sesión</span>
        </a>
      </nav>
    </header>
  `;
  document.getElementById("navbar-placeholder").innerHTML = navbarHTML;
  // También ejecutar la función de autenticación
  setTimeout(async () => {
    if (typeof initNavbarAuth === 'function') {
      await initNavbarAuth();
    } else {
      console.error('initNavbarAuth no está disponible');
    }
  }, 100);
}
