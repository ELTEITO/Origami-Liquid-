// Contacto page scripts
// Fondo igual al resto del sitio: usa data-bg o setéalo desde tu rotador existente.
(function(){
  var url = document.body.getAttribute('data-bg');
  if(url){ document.body.style.backgroundImage = "url('"+url+"')"; }
})();

// Configuración del formulario de contacto con EmailJS
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar EmailJS
  initEmailJS();

  // Configurar el formulario
  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnLoading = document.getElementById('btn-loading');
  const formMessage = document.getElementById('form-message');

  function showMessage(message, isError = false) {
    const alertIcon = formMessage.querySelector('.alert-icon');
    const alertText = formMessage.querySelector('.alert-text');

    // Configurar el contenido
    alertText.textContent = message;
    alertIcon.className = isError ? 'alert-icon fa-solid fa-exclamation-triangle' : 'alert-icon fa-solid fa-check-circle';

    // Configurar el estilo
    formMessage.className = `form-alert ${isError ? 'error' : 'success'}`;
    formMessage.style.display = 'block';

    // Auto-ocultar después de 6 segundos
    setTimeout(() => {
      formMessage.style.display = 'none';
    }, 6000);
  }

  function setLoading(loading) {
    if (loading) {
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
    } else {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Validar formulario
    const fromEmail = document.getElementById('from_email').value.trim();
    const fromName = document.getElementById('from_name').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!fromEmail || !fromName || !message) {
      showMessage('Por favor, completa todos los campos.', true);
      return;
    }

    if (!isValidEmail(fromEmail)) {
      showMessage('Por favor, ingresa un email válido.', true);
      return;
    }

    setLoading(true);

    // Enviar email usando la función de configuración
    const formData = {
      from_name: fromName,
      from_email: fromEmail,
      message: message
    };

    sendContactEmail(formData)
      .then(function(response) {
        showMessage('¡Mensaje enviado exitosamente! Te responderemos pronto.');
        form.reset(); // Limpiar formulario
      })
      .catch(function(error) {
        console.error('Error al enviar email:', error);
        showMessage('Error al enviar el mensaje. Por favor, intenta nuevamente o contáctanos por WhatsApp.', true);
      })
      .finally(function() {
        setLoading(false);
      });
  });

  // Background images
  const backgroundImages = [
    'https://assets.codepen.io/252820/unsplash-mountain3.webp',
  ];

  let currentImageIndex = 0;
  const body = document.body;

  function changeBackground() {
    const nextImage = new Image();
    const nextImageIndex = (currentImageIndex + 1) % backgroundImages.length;
    nextImage.src = backgroundImages[nextImageIndex];

    body.style.backgroundImage = `url('${backgroundImages[currentImageIndex]}')`;

    currentImageIndex = nextImageIndex;
  }

  changeBackground();

  // Forzar actualización del formulario para mostrar todos los campos
  if (form) {
    form.style.display = 'none';
    setTimeout(() => {
      form.style.display = 'flex';
    }, 100);
  }

  // Cargar EmailJS desde CDN
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  script.onload = function() {
    // Inicializar EmailJS
    initEmailJS();
  };
  document.head.appendChild(script);
});

// Cargar navbar
fetch("/Navbar/navbar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar-placeholder").innerHTML = html;
    // Ejecutar la función de autenticación después de cargar el navbar
    setTimeout(async () => {
      if (typeof initNavbarAuth === 'function') {
        await initNavbarAuth();
      } else {
        console.error('initNavbarAuth no está disponible');
      }
    }, 100);
  });

// Cargar footer
fetch("/Footer/footer.html").then(r=>r.text()).then(html=>{
  document.getElementById("footer-placeholder").innerHTML = html;
});
