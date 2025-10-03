// ==================== EMAILJS CONFIGURATION ====================
// Configuración para el envío automático de emails desde el formulario de contacto

// IMPORTANTE: Reemplaza estos valores con tus credenciales de EmailJS
const EMAILJS_CONFIG = {
  // Tu clave pública de EmailJS (puedes encontrarla en tu dashboard de EmailJS)
  PUBLIC_KEY: "MReLwCmP7Eyv4sFUL",
  
  // ID del servicio de email (Gmail, Outlook, etc.)
  SERVICE_ID: "service_l9mwc9b",
  
  // ID de la plantilla de email que creaste en EmailJS
  TEMPLATE_ID: "template_ficnd3i",
  
  // Tu email de destino (donde recibirás los mensajes)
  TO_EMAIL: "origami.importadosok@gmail.com"
};

// Función para inicializar EmailJS
function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    console.log('EmailJS inicializado correctamente');
  } else {
    console.error('EmailJS no está cargado');
  }
}

// Función para enviar email
function sendContactEmail(formData) {
  return new Promise((resolve, reject) => {
    if (typeof emailjs === 'undefined') {
      reject(new Error('EmailJS no está disponible'));
      return;
    }

    const templateParams = {
      from_name: formData.from_name,
      from_email: formData.from_email,
      message: formData.message,
      to_email: EMAILJS_CONFIG.TO_EMAIL,
      current_date: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      current_time: new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    )
    .then(function(response) {
      console.log('Email enviado exitosamente:', response);
      resolve(response);
    })
    .catch(function(error) {
      console.error('Error al enviar email:', error);
      reject(error);
    });
  });
}

// Exportar configuración para uso global
window.EMAILJS_CONFIG = EMAILJS_CONFIG;
window.initEmailJS = initEmailJS;
window.sendContactEmail = sendContactEmail;
