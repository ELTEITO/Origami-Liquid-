// Publi page - Navbar and Footer loader
// Carga Navbar y Footer
fetch("Navbar/navbar.html")
  .then((r) => r.text())
  .then((h) => {
    document.getElementById("navbar-placeholder").innerHTML = h;
    // Ejecutar la función de autenticación después de cargar el navbar
    setTimeout(async () => {
      if (typeof initNavbarAuth === 'function') {
        await initNavbarAuth();
      } else {
        console.error('initNavbarAuth no está disponible');
      }
    }, 100);
  });

fetch("Footer/footer.html")
  .then((r) => r.text())
  .then((h) => {
    document.getElementById("footer-placeholder").innerHTML = h;
  });

// Botón flotante para volver al panel si el admin está autenticado
(async function addReturnToAdminIfAuthenticated() {
  try {
    // Cargar axios si no está disponible (ya se usa en admin, pero aquí puede no estar)
    if (typeof axios === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js';
      await new Promise((resolve, reject) => { script.onload = resolve; script.onerror = reject; document.head.appendChild(script); });
    }

    const res = await axios.get('/Admin/verify', { withCredentials: true });
    if (res?.data?.isAuthenticated) {
      const btn = document.createElement('a');
      btn.href = '/admin/dashboard.html';
      btn.setAttribute('aria-label', 'Volver al panel de administración');
      btn.style.position = 'fixed';
      btn.style.bottom = '20px';
      btn.style.right = '20px';
      btn.style.zIndex = '10000';
      btn.style.padding = '0.8rem 1rem';
      btn.style.borderRadius = '999px';
      btn.style.background = 'rgba(255,255,255,0.15)';
      btn.style.backdropFilter = 'blur(10px)';
      btn.style.border = '1px solid rgba(255,255,255,0.25)';
      btn.style.color = '#fff';
      btn.style.textDecoration = 'none';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.gap = '.5rem';
      btn.innerHTML = '<i class="fa-solid fa-gauge"></i> Volver al Panel';
      document.body.appendChild(btn);
    }
  } catch (e) {
    // Usuario no autenticado, no mostrar botón
  }
})();
